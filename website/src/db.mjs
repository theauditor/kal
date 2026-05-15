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

export default {
  stages: stagesDB,
  recordings: recordingsDB,
  history: historyDB,
  artist: artistDB
};
