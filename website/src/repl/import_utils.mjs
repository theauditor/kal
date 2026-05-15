import JSZip from 'jszip';
import { userPattern } from '../user_pattern_utils.mjs';
import { recordingsDB } from '../db.mjs';

export async function importKals(file) {
  const zip = new JSZip();
  await zip.loadAsync(file);

  // Read metadata
  const metaFile = zip.file('meta.json');
  if (!metaFile) {
    throw new Error('Invalid .kals file: Missing meta.json');
  }
  const metaContent = await metaFile.async('string');
  const metadata = JSON.parse(metaContent);

  // Read code
  const codeFile = zip.file('code.strudel');
  const code = codeFile ? await codeFile.async('string') : '';

  // Read history
  const historyFile = zip.file('history.json');
  const historyContent = historyFile ? await historyFile.async('string') : '[]';
  const history = JSON.parse(historyContent);

  // Read recordings
  const recordings = [];
  const recordingsFolder = zip.folder('recordings');
  if (recordingsFolder) {
    const files = Object.keys(recordingsFolder.files);
    for (const relativePath of files) {
      if (!recordingsFolder.files[relativePath].dir) {
        const fileObj = recordingsFolder.files[relativePath];
        const content = await fileObj.async('string');
        const recId = Date.now() + Math.floor(Math.random() * 10000);
        recordings.push({
          id: recId,
          projectId: metadata.id,
          name: relativePath.split('/').pop(),
          content: content,
          date: metadata.date || new Date().toISOString(),
          duration: "Imported"
        });
      }
    }
  }

  // Update user patterns (Stage data)
  const stageData = {
    code: code,
    history: history,
    name: metadata.title,
    artist: typeof metadata.artist === 'string' && metadata.artist !== 'ANONYMOUS' ? { name: metadata.artist } : metadata.artist,
    venue: metadata.venue,
    genre: metadata.genre,
    date: metadata.date,
    id: metadata.id,
    created_at: Date.now()
  };

  await userPattern.update(metadata.id, stageData);

  // Update recordings in DB
  if (recordings.length > 0) {
    for (const rec of recordings) {
      await recordingsDB.setItem(rec.id.toString(), rec);
    }
  }

  return metadata.id;
}
