import JSZip from 'jszip';
import { getViewingPatternData } from '../user_pattern_utils.mjs';

const FALLBACK_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="90 50 320 320" width="320" height="320">
  <defs>
    <linearGradient id="goldGradBrighter" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"  style="stop-color:#f0d080;stop-opacity:1"/>
      <stop offset="40%" style="stop-color:#ffffff;stop-opacity:1"/>
      <stop offset="70%" style="stop-color:#f0d080;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#c9a84c;stop-opacity:1"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="250" cy="210" r="155" fill="none" stroke="url(#goldGradBrighter)" stroke-width="1.8" stroke-dasharray="3,6" opacity="1"/>
  <circle cx="250" cy="210" r="145" fill="none" stroke="url(#goldGradBrighter)" stroke-width="1.2" stroke-dasharray="2,5" opacity="1"/>
  <ellipse cx="250" cy="210" rx="118" ry="112" fill="none" stroke="url(#goldGradBrighter)" stroke-width="1.5" opacity="1"/>
  <ellipse cx="250" cy="210" rx="100" ry="96"  fill="none" stroke="url(#goldGradBrighter)" stroke-width="1.5" opacity="1"/>
  <ellipse cx="250" cy="210" rx="82"  ry="79"  fill="none" stroke="url(#goldGradBrighter)" stroke-width="1.8" opacity="1"/>
  <ellipse cx="250" cy="210" rx="64"  ry="62"  fill="none" stroke="url(#goldGradBrighter)" stroke-width="2" opacity="1"/>
  <ellipse cx="250" cy="210" rx="46"  ry="45"  fill="none" stroke="url(#goldGradBrighter)" stroke-width="2.5" opacity="1"/>
  <circle cx="250" cy="210" r="10" fill="#000000" stroke="url(#goldGradBrighter)" stroke-width="3" filter="url(#glow)"/>
  <circle cx="250" cy="210" r="4.5" fill="url(#goldGradBrighter)" filter="url(#glow)"/>
</svg>`;

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
      recordingsFolder.file(rec.name || `recording_${index}.kalr`, rec.content || '');
    });
  }

  // Album Art
  if (currentStage?.coverArt) {
    try {
      const [header, base64Data] = currentStage.coverArt.split(',');
      const extension = header.match(/\/(.*?);/)?.[1] || 'png';
      zip.file(`cover.${extension}`, base64Data, { base64: true });
    } catch (e) {
      console.warn('Failed to include cover art in export', e);
    }
  } else {
    // Fallback to Kal logo
    zip.file('cover.svg', FALLBACK_LOGO);
  }

  // Generate ZIP file
  const content = await zip.generateAsync({ type: 'blob' });

  // Download
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(content);
  downloadLink.download = `${stageName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.kal`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
