import localforage from 'localforage';

// Configure localforage defaults
localforage.config({
  name: 'KaalStation',
  storeName: 'kaal_data',
  description: 'Persistent storage for Kal Performance Station'
});

// Create specific stores
export const stagesDB = localforage.createInstance({
  name: 'KaalStation',
  storeName: 'stages'
});

export const recordingsDB = localforage.createInstance({
  name: 'KaalStation',
  storeName: 'recordings'
});

export const historyDB = localforage.createInstance({
  name: 'KaalStation',
  storeName: 'history'
});

export const artistDB = localforage.createInstance({
  name: 'KaalStation',
  storeName: 'artist'
});

export async function syncToFolder(folderPath) {
  if (!folderPath) return;
  const IS_TAURI = typeof window !== 'undefined' && (window.__TAURI__ || window.__TAURI_INTERNALS__);
  if (!IS_TAURI) {
    console.warn('Sync to folder is only supported in Tauri desktop environment');
    return;
  }
  try {
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    const stages = {};
    await stagesDB.iterate((value, key) => { stages[key] = value; });
    const recordings = {};
    await recordingsDB.iterate((value, key) => { recordings[key] = value; });
    const history = {};
    await historyDB.iterate((value, key) => { history[key] = value; });
    const artist = {};
    await artistDB.iterate((value, key) => { artist[key] = value; });

    const backupData = {
      timestamp: new Date().toISOString(),
      stages,
      recordings,
      history,
      artist
    };

    const filePath = `${folderPath}/kaal_backup.json`;
    await writeTextFile(filePath, JSON.stringify(backupData, null, 2));
    console.log(`[sync] 📦 Successfully synced local database to ${filePath}`);
    return true;
  } catch (err) {
    console.error('Failed to sync database to folder:', err);
    throw err;
  }
}

export default {
  stages: stagesDB,
  recordings: recordingsDB,
  history: historyDB,
  artist: artistDB,
  syncToFolder
};
