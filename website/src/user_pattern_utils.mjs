import { atom, computed } from 'nanostores';
import { useStore } from '@nanostores/react';
import { logger } from '@strudel/core';
import { nanoid } from 'nanoid';
import { settingsMap } from './settings.mjs';
import { confirmDialog, parseJSON, code2hash } from './repl/util.mjs';

import { stagesDB } from './db.mjs';

export let $publicPatterns = atom([]);
export let $featuredPatterns = atom([]);

const patternQueryLimit = 20;
export const patternFilterName = {
  public: 'latest',
  featured: 'featured',
  user: 'user',
  // stock: 'stock examples',
};

const sessionAtom = (name, initial = undefined) => {
  const storage = typeof sessionStorage !== 'undefined' ? sessionStorage : {};
  const store = atom(typeof storage[name] !== 'undefined' ? storage[name] : initial);
  store.listen((newValue) => {
    if (typeof newValue === 'undefined') {
      delete storage[name];
    } else {
      storage[name] = newValue;
    }
  });
  return store;
};

export let $viewingPatternData = sessionAtom('viewingPatternData', {
  id: '',
  code: '',
  collection: patternFilterName.user,
  created_at: Date.now(),
});

const $viewingPatterns = computed($viewingPatternData, (state) => parseJSON(state));
export const useViewingPatternData = () => useStore($viewingPatterns);
export const getViewingPatternData = () => $viewingPatterns.get();

export const setViewingPatternData = (data) => {
  $viewingPatternData.set(JSON.stringify(data));
};

function parsePageNum(page) {
  return isNaN(page) ? 0 : page;
}

export async function migrateToDB() {
  const patternsStr = settingsMap.get().userPatterns;
  if (patternsStr && patternsStr !== '{}' && patternsStr !== 'null') {
    try {
      const patterns = parseJSON(patternsStr);
      if (patterns) {
        for (const [id, data] of Object.entries(patterns)) {
          await stagesDB.setItem(id, data);
        }
        settingsMap.setKey('userPatterns', '{}');
        logger('[db] 📦 Migrated stages from localStorage to IndexedDB');
      }
    } catch (e) {
      console.error('Migration failed', e);
    }
  }
}

// reason: https://codeberg.org/uzu/strudel/issues/857
const $activePattern = sessionAtom('activePattern', '');

export function setActivePattern(key) {
  $activePattern.set(key);
}
export function getActivePattern() {
  return $activePattern.get();
}
export function useActivePattern() {
  return useStore($activePattern);
}

export const setLatestCode = (code) => settingsMap.setKey('latestCode', code);

export const defaultCode = '';
export const userPattern = {
  collection: patternFilterName.user,
  async getAll() {
    const patterns = {};
    await stagesDB.iterate((value, key) => {
      patterns[key] = value;
    });
    return patterns;
  },
  async getPatternData(id) {
    return await stagesDB.getItem(id);
  },
  async exists(id) {
    const data = await this.getPatternData(id);
    return data != null;
  },
  isValidID(id) {
    return id != null && id.length > 0;
  },

  create(initialCode = defaultCode) {
    const newID = createPatternID(initialCode);
    const data = { code: initialCode, created_at: Date.now(), id: newID, collection: this.collection };
    return { id: newID, data };
  },
  async createAndAddToDB() {
    const newPattern = this.create();
    return await this.update(newPattern.id, newPattern.data);
  },

  async update(id, data) {
    data = { ...data, id, collection: this.collection };
    await stagesDB.setItem(id, data);
    return { id, data };
  },
  async duplicate(data) {
    const newPattern = this.create();
    return await this.update(newPattern.id, { ...newPattern.data, code: data.code });
  },
  async clearAll() {
    const r = await confirmDialog(`This will delete all your patterns. Are you really sure?`);
    if (r == false) {
      return;
    }
    const viewingPatternData = getViewingPatternData();
    await stagesDB.clear();

    if (viewingPatternData.collection !== this.collection) {
      return { id: viewingPatternData.id, data: viewingPatternData };
    }
    setActivePattern(null);
    return this.create();
  },
  async delete(id) {
    await stagesDB.removeItem(id);
    if (getActivePattern() === id) {
      setActivePattern(null);
    }
    const viewingPatternData = getViewingPatternData();
    const viewingID = viewingPatternData?.id;
    if (viewingID === id) {
      return { id: null, data: { code: defaultCode } };
    }
    const nextData = await this.getPatternData(viewingID);
    return { id: viewingID, data: nextData };
  },
};

export const createPatternID = (code = '') => {
  if (!code) return nanoid(8);
  return code2hash(code).substring(0, 8);
};

export async function importPatterns(fileList) {
  const files = Array.from(fileList);
  await Promise.all(
    files.map(async (file, i) => {
      const content = await file.text();
      if (file.type === 'application/json') {
        const patterns = parseJSON(content);
        for (const [id, data] of Object.entries(patterns)) {
          await userPattern.update(id, data);
        }
      } else if (['text/x-markdown', 'text/plain'].includes(file.type)) {
        const id = file.name.replace(/\.[^/.]+$/, '');
        await userPattern.update(id, { code: content });
      }
    }),
  );
  logger(`import done!`);
}

export async function exportPatterns() {
  const userPatterns = await userPattern.getAll();
  const blob = new Blob([JSON.stringify(userPatterns)], { type: 'application/json' });
  const downloadLink = document.createElement('a');
  const prefix = window.location.hostname.split('.').join('_');
  downloadLink.href = window.URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  downloadLink.download = `${prefix}_patterns_${date}.json`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
