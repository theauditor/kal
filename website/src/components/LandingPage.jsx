import React, { useState, useEffect, useMemo } from 'react';
import { userPattern, getViewingPatternData, setViewingPatternData, setActivePattern, migrateToDB } from '../user_pattern_utils.mjs';
import { AnimatedKaalLogo } from '@branding/AnimatedKaalLogo';
import { importKals } from '../repl/import_utils.mjs';
import { logger } from '@strudel/core';
import { settingsMap } from '../settings.mjs';
import { useStore } from '@nanostores/react';
import { artistDB, recordingsDB } from '../db.mjs';

// Desktop App Styles
const styles = {
  container: "flex h-screen bg-[#0a0a0a] text-[#dae3f1] font-sans selection:bg-[#c9a84c]/30 overflow-hidden",
  sidebar: "w-20 flex flex-col items-center py-8 border-r border-[#1a1a1a] bg-[#050505] shrink-0",
  main: "flex-grow flex flex-col min-w-0 bg-[#0a0a0a]",
  header: "h-16 border-b border-[#1a1a1a] flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10",
  content: "flex-grow overflow-y-auto p-8",
  tabBtn: (active) => `w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-all duration-300 ${active ? 'bg-[#c9a84c] text-black shadow-[0_0_20px_rgba(201,168,76,0.3)]' : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'}`,
  card: "bg-[#111] border border-[#1a1a1a] hover:border-[#c9a84c]/30 rounded-xl p-5 transition-all duration-300 group hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
  input: "bg-[#111] border border-[#222] focus:border-[#c9a84c] rounded-lg px-4 py-2 text-sm focus:outline-none transition-all w-64",
  buttonPrimary: "bg-[#c9a84c] hover:bg-[#d4b761] text-black font-bold py-2 px-5 rounded-lg text-sm transition-all flex items-center gap-2",
  badge: "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter",
  modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4",
  modalContent: "bg-[#0a0a0a] border border-[#c9a84c]/30 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(201,168,76,0.15)] animate-in fade-in zoom-in duration-300",
  formGroup: "mb-5",
  label: "block text-[10px] font-bold text-[#c9a84c] uppercase tracking-widest mb-2",
  modalInput: "w-full bg-[#111] border border-[#222] focus:border-[#c9a84c] rounded-lg px-4 py-3 text-sm focus:outline-none transition-all text-white",
  select: "w-full bg-[#111] border border-[#222] focus:border-[#c9a84c] rounded-lg px-4 py-3 text-sm focus:outline-none transition-all text-white appearance-none",
};

const GENRES = [
  "Ambient", "Acid Techno", "Breakbeat", "Deep House", "Drum & Bass", "Dubstep", 
  "Electro", "Experimental", "Footwork", "Glitch", "Hardcore", "IDM", "Industrial", 
  "Jungle", "Lo-fi", "Minimal Techno", "Noise", "Phonk", "Psytrance", "Synthwave", 
  "Techno", "Trance", "Trap", "Vaporwave", "Classical", "Jazz", "Rock", "Hip Hop", "Pop"
].sort();

const GREETINGS = {
  morning: [
    "Feeling inspired today morning?", "The dawn brings new rhythms.", "Sunrise is the best time for a fresh loop.",
    "Morning light, morning beat.", "Start the day with a solid groove.", "Early bird gets the best samples.",
    "Waking up the oscillators.", "A fresh canvas for your sound.", "Morning coffee and modular synths.",
    "The world is quiet, let's make some noise.", "Breathe in, sequence out.", "Today's sound starts here.",
    "Morning inspiration is the purest.", "Let the day flow through your patterns.", "Good morning, time to create.",
    "The air is crisp, the beats are sharp.", "New day, new sonic exploration.", "First light, first note.",
    "Awaken your creativity.", "The morning frequencies are calling."
  ],
  afternoon: [
    "Afternoon energy, full volume.", "Peak creativity in the midday sun.", "The rhythm of the afternoon is yours.",
    "Keep the momentum going.", "Sun is high, bass is low.", "Midday session in progress.",
    "Finding the flow in the afternoon heat.", "Synthesizing the day's energy.", "Afternoon vibes, perfect for deep dives.",
    "Your creativity is at its zenith.", "Powering through the afternoon beats.", "The day is half done, the music is just starting.",
    "Vibrant sounds for a vibrant afternoon.", "Capture the midday inspiration.", "Afternoon echoes, afternoon dreams.",
    "Stay focused, stay rhythmic.", "The sun is shining on your sequence.", "Midday groove, midday mood.",
    "Afternoon sessions are for bold choices.", "Keep the sound evolving."
  ],
  evening: [
    "Evening glow, mellow beats.", "The day settles, the music rises.", "Cool evening, warm analog sounds.",
    "Twilight is for deep textures.", "Evening inspiration is settling in.", "The golden hour of creativity.",
    "Sunset sequences.", "Winding down the day, winding up the synths.", "Evening echoes through the station.",
    "Relaxed mind, complex patterns.", "The evening air carries the sound further.", "Twilight sessions bring out the magic.",
    "Gentle rhythms for the fading light.", "Evening is for exploration.", "Soft synths for a soft evening.",
    "The stars are coming out, let the music shine.", "Evening moods, evening grooves.", "A perfect end to a productive day.",
    "Let the evening guide your melody.", "Sunset sounds for a quiet mind."
  ],
  night: [
    "This night requires your creativity!", "The dark is full of deep bass.", "Late night, late loops.",
    "Midnight magic in the making.", "The moon is your only audience.", "Deep night, deep thoughts, deep sound.",
    "Creativity thrives in the silence of the night.", "Night owl session started.", "The city sleeps, the station works.",
    "Neon lights and late night synths.", "Atmospheric night, atmospheric sound.", "The night is long, the sequence is longer.",
    "Dreamy late night vibes.", "The subconscious takes the lead at night.", "Moonlit melodies.",
    "Nighttime is the right time for techno.", "Lost in the night, found in the music.", "Electronic dreams for a quiet night.",
    "The stars are pulsing with your beat.", "Late night exploration of the unknown."
  ]
};

const getRandomGreeting = () => {
  const hour = new Date().getHours();
  let category = 'night';
  if (hour >= 5 && hour < 12) category = 'morning';
  else if (hour >= 12 && hour < 17) category = 'afternoon';
  else if (hour >= 17 && hour < 21) category = 'evening';
  
  const list = GREETINGS[category];
  return list[Math.floor(Math.random() * list.length)];
};

const StageItem = ({ stage, recordings, onOpen, onRename, onDelete, onUpdateCover }) => {
  const stageRecs = recordings.filter(r => r.projectId === stage.id);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(stage.name || 'Untitled');
  const fileInputRef = React.useRef(null);

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCover(stage.id, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`${styles.card} relative overflow-hidden group`}>
      {stage.coverArt && (
        <div className="absolute inset-0 z-0">
          <img src={stage.coverArt} className="w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
        </div>
      )}
      
      <div className="relative z-10 flex flex-col h-full">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <div className="flex justify-between items-start mb-4">
          <div 
            onClick={handleIconClick}
            className="w-10 h-10 rounded-lg bg-[#c9a84c]/5 border border-[#c9a84c]/10 flex items-center justify-center cursor-pointer hover:bg-[#c9a84c]/10 transition-all overflow-hidden relative group/icon"
          >
            {stage.coverArt ? (
              <img src={stage.coverArt} className="w-full h-full object-cover group-hover/icon:scale-110 transition-transform duration-500" alt="Cover Art" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button onClick={() => onDelete(stage.id)} className="p-1.5 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </div>

        {isEditing ? (
          <input 
            autoFocus 
            className="w-full bg-[#0a0a0a] border border-[#c9a84c] rounded px-2 py-1 text-sm mb-1 z-20" 
            value={name} 
            onChange={e => setName(e.target.value)}
            onBlur={() => { onRename(stage.id, name); setIsEditing(false); }}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
          />
        ) : (
          <h3 className="font-bold text-white mb-1 group-hover:text-[#c9a84c] transition-colors truncate text-lg">{stage.name || 'Untitled'}</h3>
        )}
        
        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono mb-6">
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-gray-500"></span>{stage.id}</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#c9a84c]"></span>{stageRecs.length} RECS</span>
        </div>

        <div className="mt-auto">
          <button onClick={() => onOpen(stage.id)} className="w-full py-2.5 bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/5 hover:bg-[#c9a84c] text-gray-400 hover:text-black rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all shadow-xl">
            Open Stage
          </button>
          {stage.venue && (
            <div className="mt-3 flex items-center gap-2 opacity-80">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span className="text-[9px] uppercase tracking-tighter text-[#dae3f1]">{stage.venue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArtistProfileModal = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    dob: '',
    tagline: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id') {
      // restricted to small chars, numbers, dots and underscores. no spaces
      const filteredValue = value.toLowerCase().replace(/[^a-z0-9._]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      setError('Artist ID and Name are required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Artist Profile</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Permanent Identity</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Artist ID (Username)</label>
            <input 
              name="id"
              className={styles.modalInput} 
              placeholder="e.g. artist.name_01"
              value={formData.id}
              onChange={handleChange}
              required
            />
            <p className="text-[9px] text-gray-600 mt-1 italic">Lowercase, numbers, dots, underscores only.</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input 
              name="name"
              className={styles.modalInput} 
              placeholder="Your professional name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className={styles.label}>Date of Birth</label>
              <input 
                name="dob"
                type="date"
                className={styles.modalInput} 
                value={formData.dob}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={styles.label}>Tagline</label>
              <input 
                name="tagline"
                className={styles.modalInput} 
                placeholder="Brief bio..."
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] mb-4 uppercase font-bold">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" className={styles.buttonPrimary + " flex-1 justify-center"}>
              SAVE PROFILE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NewStageModal = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    genre: 'Techno'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">New Stage</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Session Configuration</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Stage Title</label>
            <input 
              autoFocus
              className={styles.modalInput} 
              placeholder="Untitled Masterpiece"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Venue / Location</label>
            <input 
              className={styles.modalInput} 
              placeholder="Studio A / Club Name"
              value={formData.venue}
              onChange={e => setFormData({...formData, venue: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className={styles.label}>Performance Date</label>
              <input 
                type="date"
                className={styles.modalInput} 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className={styles.label}>Genre</label>
              <div className="relative">
                <select 
                  className={styles.select}
                  value={formData.genre}
                  onChange={e => setFormData({...formData, genre: e.target.value})}
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-3 bg-[#111] hover:bg-[#1a1a1a] text-gray-500 hover:text-white rounded-lg text-sm font-bold transition-all">
              CANCEL
            </button>
            <button type="submit" className={styles.buttonPrimary + " flex-1 justify-center"}>
              CREATE STAGE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('stages');
  const [search, setSearch] = useState('');
  const [stages, setStages] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const importInputRef = React.useRef(null);
  
  const [artistProfile, setArtistProfile] = useState(null);

  useEffect(() => {
    async function loadData() {
      // Migrate if needed
      await migrateToDB();

      // Load initial data
      const patterns = await userPattern.getAll();
      const allStages = Object.values(patterns).sort((a, b) => b.created_at - a.created_at);
      setStages(allStages);
      
      try {
        // Load recordings from DB
        const savedRecs = [];
        await recordingsDB.iterate((value) => {
          savedRecs.push(value);
        });
        setRecordings(savedRecs.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (e) {
        console.warn('Failed to load recordings', e);
      }

      // Load artist profile from DB
      try {
        const profile = await artistDB.getItem('profile');
        setArtistProfile(profile);
      } catch (e) {
        console.warn('Failed to load artist profile', e);
      }

      setIsLoading(false);
    }
    
    loadData();
  }, []);

  const filteredStages = stages.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRecordings = recordings.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.projectId.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateStage = () => {
    if (!artistProfile) {
      setShowArtistModal(true);
    } else {
      setShowStageModal(true);
    }
  };

  const saveArtistProfile = async (profile) => {
    await artistDB.setItem('profile', profile);
    setArtistProfile(profile);
    setShowArtistModal(false);
    setShowStageModal(true);
  };

  const createStageWithMetadata = async (metadata) => {
    const { id, data } = userPattern.create();
    const updatedData = { 
      ...data, 
      name: metadata.title || 'Untitled',
      venue: metadata.venue,
      date: metadata.date,
      genre: metadata.genre,
      artist: artistProfile
    };
    await userPattern.update(id, updatedData);
    window.location.href = `/p/#${id}`;
  };

  const handleRename = async (id, newName) => {
    const stage = await userPattern.getPatternData(id);
    if (stage) {
      await userPattern.update(id, { ...stage, name: newName });
      const patterns = await userPattern.getAll();
      setStages(Object.values(patterns).sort((a, b) => b.created_at - a.created_at));
    }
  };

  const handleUpdateCover = async (id, coverArt) => {
    const stage = await userPattern.getPatternData(id);
    if (stage) {
      await userPattern.update(id, { ...stage, coverArt });
      const patterns = await userPattern.getAll();
      setStages(Object.values(patterns).sort((a, b) => b.created_at - a.created_at));
      logger(`[stage] 🖼 cover art updated for "${stage.name || id}"`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete stage?')) {
      await userPattern.delete(id);
      const patterns = await userPattern.getAll();
      setStages(Object.values(patterns).sort((a, b) => b.created_at - a.created_at));
    }
  };

  const handleDeleteRecording = async (id) => {
    if (confirm('Delete recording?')) {
      await recordingsDB.removeItem(id);
      const updated = recordings.filter(r => r.id !== id);
      setRecordings(updated);
    }
  };

  const handleImportClick = () => {
    if (importInputRef.current) {
      importInputRef.current.click();
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const stageId = await importKals(file);
      // Refresh state
      const patterns = await userPattern.getAll();
      const allStages = Object.values(patterns).sort((a, b) => b.created_at - a.created_at);
      setStages(allStages);
      
      const savedRecs = [];
      await recordingsDB.iterate((value) => {
        savedRecs.push(value);
      });
      setRecordings(savedRecs.sort((a, b) => new Date(b.date) - new Date(a.date)));
      
      logger(`[import] 📦 Successfully imported stage ${stageId}`);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import .kal file: ' + err.message);
    }
    // Reset input
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#050505] z-[1000] flex flex-col items-center justify-center">
        <AnimatedKaalLogo size={200} />
        <h1 className="mt-8 text-[#c9a84c] text-2xl font-bold tracking-[0.5em] animate-pulse">KĀL</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Sidebar Navigation */}
      <div className={styles.sidebar}>
        <div className="mb-12"><AnimatedKaalLogo size={40} /></div>
        <button onClick={() => setActiveTab('stages')} className={styles.tabBtn(activeTab === 'stages')} title="Stages">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button onClick={() => setActiveTab('recordings')} className={styles.tabBtn(activeTab === 'recordings')} title="Recordings Library">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
        <div className="mt-auto">
          <button onClick={() => window.open('https://github.com/strudel/kaal', '_blank')} className="text-gray-600 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a84c]">
              {activeTab === 'stages' ? 'Production Stages' : 'Recordings Library'}
            </h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                className={styles.input + " pl-9"} 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              ref={importInputRef} 
              onChange={handleImportFile} 
              accept=".kal" 
              className="hidden" 
            />
            <button onClick={handleImportClick} className={styles.buttonPrimary.replace('bg-[#c9a84c]', 'bg-[#1a1a1a] text-gray-400 border border-[#c9a84c]/30 hover:bg-[#c9a84c]/20 hover:text-white')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              IMPORT
            </button>
            <button onClick={handleCreateStage} className={styles.buttonPrimary}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              NEW STAGE
            </button>
          </div>
        </header>

        <main className={styles.content}>
          {activeTab === 'stages' && (
            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-[#c9a84c]/10 to-transparent p-8 rounded-2xl border border-[#c9a84c]/20">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    Hello <span className="text-[#c9a84c]">{artistProfile ? artistProfile.name : 'Artist'}</span>
                  </h1>
                  <p className="text-gray-400 text-lg italic">{getRandomGreeting()}</p>
                </div>
                {artistProfile && (
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded border border-[#c9a84c]/20 uppercase tracking-widest">
                        {artistProfile.id}
                      </span>
                      {artistProfile.tagline && (
                        <span className="text-[10px] text-gray-500 italic">"{artistProfile.tagline}"</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-[10px] text-gray-600 font-mono uppercase tracking-tighter">
                      <span>DOB: {artistProfile.dob || 'N/A'}</span>
                      <span>STATUS: Verified Artist</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stages' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {filteredStages.map(p => (
                <StageItem 
                  key={p.id} 
                  stage={p} 
                  recordings={recordings}
                  onOpen={id => window.location.href = `/p/#${id}`}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onUpdateCover={handleUpdateCover}
                />
              ))}
              {filteredStages.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-[#222] rounded-2xl opacity-50">
                  <p className="text-sm italic">No stages found.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#050505] border-b border-[#1a1a1a]">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Take Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Stage</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Duration</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecordings.map(rec => (
                      <tr key={rec.id} className="border-b border-[#1a1a1a]/50 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-bold text-sm text-white group-hover:text-[#c9a84c] transition-colors">{rec.name}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">{rec.projectId}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(rec.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-xs font-mono text-right text-gray-400">{rec.duration}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                const blob = new Blob([rec.content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = rec.name;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="p-1.5 hover:bg-[#c9a84c]/10 rounded text-gray-500 hover:text-[#c9a84c]"
                              title="Download"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </button>
                            <button onClick={() => handleDeleteRecording(rec.id)} className="p-1.5 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-500" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRecordings.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-20 text-center text-gray-600 italic text-sm">No recordings found in library.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        <footer className="h-8 border-t border-[#1a1a1a] bg-[#050505] flex items-center px-8 justify-between">
          <div className="flex items-center gap-4 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
            <span>System: Kāl-Station-V1</span>
            <span>Status: Operational</span>
            <span>Local DB: {stages.length} Stages / {recordings.length} Takes</span>
            {artistProfile && (
              <span className="text-[#c9a84c]">Artist: {artistProfile.id}</span>
            )}
          </div>
          <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
            &copy; 2026 Performance Engine
          </div>
        </footer>
      </div>

      {showArtistModal && (
        <ArtistProfileModal 
          onSave={saveArtistProfile} 
          onCancel={() => setShowArtistModal(false)} 
        />
      )}

      {showStageModal && (
        <NewStageModal 
          onSave={createStageWithMetadata} 
          onCancel={() => setShowStageModal(false)} 
        />
      )}
    </div>
  );
}
