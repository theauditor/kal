import JSZip from 'jszip';
import { getViewingPatternData } from '../user_pattern_utils.mjs';

export async function exportToKals(code, recordings) {
  const currentStage = getViewingPatternData();
  const stageName = currentStage?.name || 'Untitled';
  const projectId = currentStage?.id || 'new';

  const zip = new JSZip();

  // Metadata
  const metadata = {
    title: stageName,
    artist: currentStage?.artist?.name || 'ANONYMOUS',
    venue: currentStage?.venue || 'KĀL_STATION_01',
    genre: currentStage?.genre || 'EXPERIMENTAL',
    date: currentStage?.date || new Date().toISOString(),
    id: projectId
  };

  zip.file('meta.json', JSON.stringify(metadata, null, 2));

  // Current REPL Code
  zip.file('code.strudel', code || '');

  // History
  const history = currentStage?.history || [];
  zip.file('history.json', JSON.stringify(history, null, 2));

  // Recordings
  const stageRecordings = recordings.filter(r => r.projectId === projectId);
  if (stageRecordings.length > 0) {
    const recordingsFolder = zip.folder('recordings');
    stageRecordings.forEach((rec, index) => {
      recordingsFolder.file(rec.name || `recording_${index}.kal`, rec.content || '');
    });
  }

  // Generate ZIP file
  const content = await zip.generateAsync({ type: 'blob' });

  // Download
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(content);
  downloadLink.download = `${stageName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.kals`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
