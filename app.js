/**
 * ArtsPo Livres Audio - Progressive Web App
 * Lecteur d'audiolivres avec support offline, bookmarks et transcriptions
 * @version 1.0.0
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const FEEDS = [
  { id: 'seneque', url: '/api/feed/podcast', fallbackUrl: 'https://artspo-livresaudio.store/index.php/feed/podcast' },
  { id: 'contrun', url: '/api/feed/podcast2', fallbackUrl: 'https://artspo-livresaudio.store/index.php/feed/podcast2' },
  { id: 'luciole', url: '/api/feed/podcast3/', fallbackUrl: 'https://artspo-livresaudio.store/index.php/feed/podcast3/' }
];

const DB_NAME = 'artspo-audio';
const DB_VERSION = 1;

// ============================================================================
// ICÔNES SVG
// ============================================================================

const Icons = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
  skipPrev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
  skipNext: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
  replay15: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
  forward15: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  downloaded: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>',
  bookmarkOutline: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
  speed: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.38 8.57l-1.23 1.85a8 8 0 01-.22 7.58H5.07A8 8 0 0115.58 6.85l1.85-1.23A10 10 0 003.35 19a2 2 0 001.72 1h13.85a2 2 0 001.74-1 10 10 0 00-.27-10.44z"/></svg>',
  sleep: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-12.09-8.43-8.32-14.96z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
  download2: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
};

// ============================================================================
// GESTION D'ÉTAT GLOBAL
// ============================================================================

const state = {
  books: [],
  currentBook: null,
  currentEpisodeIndex: -1,
  isPlaying: false,
  playbackSpeed: 1,
  sleepTimer: null,
  currentView: 'library',
  navigationHistory: ['library']
};

// Instance audio unique
const audio = new Audio();
audio.preload = 'metadata';

// IndexedDB
let db = null;

// Variables pour le débogage du progrès
let lastProgressSave = 0;
const PROGRESS_SAVE_INTERVAL = 5000; // 5 secondes

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Convertit les secondes en format "M:SS" ou "H:MM:SS"
 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Convertit une chaîne de temps "M:SS" ou "H:MM:SS" en secondes
 */
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

/**
 * Affiche une notification toast
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }
}

/**
 * Affiche une modale
 */
function showModal(type) {
  const overlay = document.getElementById('modal-overlay');
  if (type === 'speed') {
    const speedModal = document.getElementById('speed-modal');
    if (speedModal) speedModal.classList.remove('hidden');
  } else if (type === 'sleep') {
    const sleepModal = document.getElementById('sleep-modal');
    if (sleepModal) sleepModal.classList.remove('hidden');
  } else if (type === 'bookmarks') {
    const bookmarksModal = document.getElementById('bookmarks-modal');
    if (bookmarksModal) bookmarksModal.classList.remove('hidden');
  }
  if (overlay) overlay.classList.remove('hidden');
}

/**
 * Masque toutes les modales
 */
function hideModals() {
  const overlay = document.getElementById('modal-overlay');
  const speedModal = document.getElementById('speed-modal');
  const sleepModal = document.getElementById('sleep-modal');
  const bookmarksModal = document.getElementById('bookmarks-modal');

  if (overlay) overlay.classList.add('hidden');
  if (speedModal) speedModal.classList.add('hidden');
  if (sleepModal) sleepModal.classList.add('hidden');
  if (bookmarksModal) bookmarksModal.classList.add('hidden');
}

/**
 * Convertit les chiffres romains en entier
 */
function romanToInt(roman) {
  const romanMap = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50,
    'C': 100, 'D': 500, 'M': 1000
  };

  let result = 0;
  let prevValue = 0;

  for (let i = roman.length - 1; i >= 0; i--) {
    const value = romanMap[roman[i].toUpperCase()];
    if (!value) return null;

    if (value < prevValue) {
      result -= value;
    } else {
      result += value;
    }
    prevValue = value;
  }

  return result;
}

/**
 * Extrait le numéro d'épisode du titre
 */
function extractEpisodeNumber(title) {
  // Cherche "chapitre X", "chapter X", "épisode X", etc.
  const patterns = [
    /chapitre\s+(\d+)/i,
    /chapter\s+(\d+)/i,
    /épisode\s+(\d+)/i,
    /episode\s+(\d+)/i,
    /ep\.\s*(\d+)/i,
    /^\d+[\.\-\s]/, // Numéro au début
    /\b(\d+)(?:\s*–|\s*-|\s+of|\s*$)/ // Numéro isolé
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0 && num < 1000) {
        return num;
      }
    }
  }

  // Essai des chiffres romains
  const romanPattern = /\b([IVX]+)\b/i;
  const romanMatch = title.match(romanPattern);
  if (romanMatch) {
    const num = romanToInt(romanMatch[1]);
    if (num && num > 0 && num < 1000) {
      return num;
    }
  }

  return null;
}

/**
 * Nettoie le HTML basique (convertit les \n en <p>)
 */
function sanitizeHTML(text) {
  if (!text) return '';
  return text
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/**
 * Partage du contenu avec Web Share API
 */
async function shareContent(title, text, url) {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Erreur de partage:', err);
      }
    }
  } else {
    // Fallback: copier le lien dans le presse-papiers
    try {
      await navigator.clipboard.writeText(url);
      showToast('Lien copié dans le presse-papiers');
    } catch (err) {
      console.error('Erreur de copie:', err);
      showToast('Impossible de copier le lien');
    }
  }
}

/**
 * Retour à la vue précédente
 */
function goBack() {
  if (state.navigationHistory.length > 1) {
    state.navigationHistory.pop();
    const prevView = state.navigationHistory[state.navigationHistory.length - 1];
    navigate(prevView);
  } else {
    navigate('library');
  }
}

// ============================================================================
// GESTION DE LA BASE DE DONNÉES (IndexedDB)
// ============================================================================

/**
 * Initialise la base de données IndexedDB
 */
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Object store pour les épisodes téléchargés
      if (!db.objectStoreNames.contains('episodes')) {
        db.createObjectStore('episodes', { keyPath: 'id' });
      }

      // Object store pour la progression de lecture
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id' });
      }

      // Object store pour les signets
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
      }

      // Object store pour les paramètres
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Sauvegarde la progression de lecture
 */
async function saveProgress(bookId, episodeIndex, currentTime, duration) {
  if (!db) return;

  const transaction = db.transaction(['progress'], 'readwrite');
  const store = transaction.objectStore('progress');

  const id = `${bookId}-${episodeIndex}`;
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  await store.put({
    id,
    bookId,
    episodeIndex,
    currentTime: Math.round(currentTime),
    duration: Math.round(duration),
    percentage: Math.round(percentage),
    lastPlayed: new Date().toISOString()
  });
}

/**
 * Récupère la progression pour un épisode
 */
async function getProgress(bookId, episodeIndex) {
  if (!db) return null;

  return new Promise((resolve) => {
    const transaction = db.transaction(['progress'], 'readonly');
    const store = transaction.objectStore('progress');
    const id = `${bookId}-${episodeIndex}`;

    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

/**
 * Récupère la progression globale pour un livre
 */
async function getBookProgress(bookId) {
  if (!db) return { totalChapters: 0, completedChapters: 0, totalSeconds: 0, listenedSeconds: 0 };

  return new Promise((resolve) => {
    const transaction = db.transaction(['progress'], 'readonly');
    const store = transaction.objectStore('progress');

    const request = store.getAll();
    request.onsuccess = () => {
      const progresses = request.result.filter(p => p.bookId === bookId);

      let totalSeconds = 0;
      let listenedSeconds = 0;
      let completedChapters = 0;

      progresses.forEach(p => {
        totalSeconds += p.duration;
        listenedSeconds += p.currentTime;
        if (p.percentage >= 95) completedChapters++;
      });

      resolve({
        totalChapters: progresses.length,
        completedChapters,
        totalSeconds,
        listenedSeconds
      });
    };
    request.onerror = () => resolve({ totalChapters: 0, completedChapters: 0, totalSeconds: 0, listenedSeconds: 0 });
  });
}

/**
 * Télécharge un épisode pour l'écoute hors ligne
 */
async function downloadEpisode(bookId, episodeIndex, audioUrl) {
  if (!db) throw new Error('Base de données non disponible');

  try {
    // Essai d'abord avec le proxy
    let fetchUrl = audioUrl;

    // Si c'est une URL directe artspo-livresaudio.store, utiliser le proxy
    if (audioUrl.includes('artspo-livresaudio.store')) {
      const match = audioUrl.match(/\/wp-content\/uploads\/(.+)$/);
      if (match) {
        fetchUrl = `/api/audio/${match[1]}`;
      }
    }

    let response = await fetch(fetchUrl);

    // Si le proxy échoue, utiliser l'URL directe
    if (!response.ok && fetchUrl !== audioUrl) {
      response = await fetch(audioUrl);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();

    const transaction = db.transaction(['episodes'], 'readwrite');
    const store = transaction.objectStore('episodes');

    const id = `${bookId}-${episodeIndex}`;
    await store.put({
      id,
      bookId,
      episodeIndex,
      audioBlob: blob,
      downloadedAt: new Date().toISOString(),
      fileSize: blob.size
    });
  } catch (err) {
    console.error('Erreur lors du téléchargement:', err);
    throw err;
  }
}

/**
 * Récupère un épisode téléchargé
 */
async function getDownloadedEpisode(bookId, episodeIndex) {
  if (!db) return null;

  return new Promise((resolve) => {
    const transaction = db.transaction(['episodes'], 'readonly');
    const store = transaction.objectStore('episodes');
    const id = `${bookId}-${episodeIndex}`;

    const request = store.get(id);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.audioBlob : null);
    };
    request.onerror = () => resolve(null);
  });
}

/**
 * Vérifie si un épisode est téléchargé
 */
async function isEpisodeDownloaded(bookId, episodeIndex) {
  if (!db) return false;

  return new Promise((resolve) => {
    const transaction = db.transaction(['episodes'], 'readonly');
    const store = transaction.objectStore('episodes');
    const id = `${bookId}-${episodeIndex}`;

    const request = store.get(id);
    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => resolve(false);
  });
}

/**
 * Supprime un épisode téléchargé
 */
async function deleteDownloadedEpisode(bookId, episodeIndex) {
  if (!db) return;

  const transaction = db.transaction(['episodes'], 'readwrite');
  const store = transaction.objectStore('episodes');
  const id = `${bookId}-${episodeIndex}`;

  await store.delete(id);
}

/**
 * Ajoute un signet
 */
async function addBookmark(bookId, episodeIndex, time, label) {
  if (!db) return;

  const transaction = db.transaction(['bookmarks'], 'readwrite');
  const store = transaction.objectStore('bookmarks');

  await store.add({
    bookId,
    episodeIndex,
    time: Math.round(time),
    label: label || `${formatTime(time)}`,
    createdAt: new Date().toISOString()
  });
}

/**
 * Récupère les signets pour un livre
 */
async function getBookmarks(bookId) {
  if (!db) return [];

  return new Promise((resolve) => {
    const transaction = db.transaction(['bookmarks'], 'readonly');
    const store = transaction.objectStore('bookmarks');

    const request = store.getAll();
    request.onsuccess = () => {
      const bookmarks = request.result
        .filter(b => b.bookId === bookId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(bookmarks);
    };
    request.onerror = () => resolve([]);
  });
}

/**
 * Supprime un signet
 */
async function deleteBookmark(id) {
  if (!db) return;

  const transaction = db.transaction(['bookmarks'], 'readwrite');
  const store = transaction.objectStore('bookmarks');

  await store.delete(id);
}

/**
 * Sauvegarde un paramètre
 */
async function saveSetting(key, value) {
  if (!db) return;

  const transaction = db.transaction(['settings'], 'readwrite');
  const store = transaction.objectStore('settings');

  await store.put({ key, value });
}

/**
 * Récupère un paramètre
 */
async function getSetting(key) {
  if (!db) return null;

  return new Promise((resolve) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');

    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ? request.result.value : null);
    request.onerror = () => resolve(null);
  });
}

// ============================================================================
// PARSAGE DES FLUX RSS
// ============================================================================

/**
 * Récupère et analyse tous les flux RSS
 */
async function fetchAndParseFeeds() {
  const results = [];

  for (const feed of FEEDS) {
    try {
      let xml = null;

      // Essai du proxy d'abord
      try {
        const response = await fetch(feed.url, { signal: AbortSignal.timeout(10000) });
        if (response.ok) {
          xml = await response.text();
        }
      } catch (err) {
        console.warn(`Proxy échoué pour ${feed.id}, utilisation de l'URL de secours`, err);
      }

      // Utiliser l'URL de secours si le proxy a échoué
      if (!xml) {
        const response = await fetch(feed.fallbackUrl, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        xml = await response.text();
      }

      const book = parseFeed(xml, feed.id);
      if (book) results.push(book);
    } catch (err) {
      console.error('Erreur lors du chargement du flux ' + feed.id + ':', err);
      showToast(`Erreur lors du chargement de ${feed.id}. Vérifiez votre connexion.`);
    }
  }

  return results;
}

/**
 * Parse un flux RSS en objet livre
 */
function parseFeed(xmlText, feedId) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Erreur de parsing XML');
    }

    const channel = xmlDoc.getElementsByTagName('channel')[0];
    if (!channel) throw new Error('Pas de channel trouvé');

    // Extraction des infos du channel
    const title = channel.querySelector('title')?.textContent || 'Sans titre';
    const description = channel.querySelector('description')?.textContent || '';
    const author = channel.querySelector('itunes\\:author')?.textContent ||
                   channel.querySelector('[name="itunes:author"]')?.textContent || 'Auteur inconnu';
    const copyright = channel.querySelector('copyright')?.textContent || '';

    // Image iTunes
    let coverUrl = null;
    const itunesImage = channel.querySelector('itunes\\:image');
    if (itunesImage) {
      coverUrl = itunesImage.getAttribute('href');
    }
    if (!coverUrl) {
      const imageTag = channel.querySelector('image > url');
      if (imageTag) coverUrl = imageTag.textContent;
    }

    // Traitement des épisodes
    const episodes = [];
    const items = channel.querySelectorAll('item');

    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent || 'Sans titre';
      const enclosure = item.querySelector('enclosure');

      if (!enclosure) return; // Ignorer les items sans audio

      const audioUrl = enclosure.getAttribute('url');
      if (!audioUrl) return;

      const description = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';

      // Duration iTunes
      const durationStr = item.querySelector('itunes\\:duration')?.textContent ||
                          item.querySelector('[name="itunes:duration"]')?.textContent || '0:00';
      const durationSeconds = parseTimeToSeconds(durationStr);

      // Episode number iTunes
      let episodeNumber = null;
      const itunesEpisode = item.querySelector('itunes\\:episode')?.textContent ||
                            item.querySelector('[name="itunes:episode"]')?.textContent;
      if (itunesEpisode) {
        episodeNumber = parseInt(itunesEpisode, 10);
      }

      // Si pas de numéro iTunes, essayer d'extraire du titre
      if (!episodeNumber) {
        episodeNumber = extractEpisodeNumber(title);
      }

      episodes.push({
        index: index,
        title,
        audioUrl,
        duration: durationStr,
        durationSeconds,
        description,
        link,
        pubDate,
        episodeNumber: episodeNumber || (index + 1)
      });
    });

    // Tri des épisodes en ordre croissant
    episodes.sort((a, b) => {
      // D'abord par numéro d'épisode
      if (a.episodeNumber !== null && b.episodeNumber !== null) {
        return a.episodeNumber - b.episodeNumber;
      }
      // Puis par date de publication
      if (a.pubDate && b.pubDate) {
        return new Date(a.pubDate) - new Date(b.pubDate);
      }
      // Finalement par ordre initial
      return a.index - b.index;
    });

    // Mise à jour des indices
    episodes.forEach((ep, i) => {
      ep.index = i;
    });

    return {
      id: feedId,
      title,
      author,
      description,
      coverUrl,
      copyright,
      episodes
    };
  } catch (err) {
    console.error('Erreur lors du parsing du flux ' + feedId + ':', err);
    return null;
  }
}

// ============================================================================
// CONTRÔLEUR LECTEUR AUDIO
// ============================================================================

/**
 * Lance la lecture d'un épisode
 */
async function playEpisode(book, episodeIndex) {
  state.currentBook = book;
  state.currentEpisodeIndex = episodeIndex;

  const episode = book.episodes[episodeIndex];
  if (!episode) {
    showToast('Épisode non trouvé');
    return;
  }

  try {
    // Chercher l'épisode téléchargé
    const downloadedBlob = await getDownloadedEpisode(book.id, episodeIndex);

    if (downloadedBlob) {
      audio.src = URL.createObjectURL(downloadedBlob);
    } else {
      audio.src = episode.audioUrl;
    }

    // Restaurer la progression
    const progress = await getProgress(book.id, episodeIndex);
    if (progress && progress.currentTime > 0) {
      audio.currentTime = progress.currentTime;
    }

    // Mettre à jour le lecteur et la mini-barre
    updateMediaSession();
    renderPlayer();
    updateMiniPlayer();

    // Lancer la lecture
    await audio.play();
    state.isPlaying = true;

    // Sauvegarder l'état de lecture
    await saveSetting('lastBookId', book.id);
    await saveSetting('lastEpisodeIndex', episodeIndex);

    // Afficher le mini-lecteur si pas déjà sur la page du lecteur
    if (state.currentView !== 'player') {
      const miniPlayer = document.getElementById('mini-player');
      if (miniPlayer) miniPlayer.classList.remove('hidden');
      document.getElementById('app').classList.add('has-mini-player');
    }
  } catch (err) {
    console.error('Erreur lors du démarrage de la lecture:', err);
    showToast('Erreur lors du démarrage de la lecture');
  }
}

/**
 * Bascule lecture/pause
 */
async function togglePlayPause() {
  if (!state.currentBook) {
    showToast('Aucun livre sélectionné');
    return;
  }

  try {
    if (audio.paused) {
      await audio.play();
      state.isPlaying = true;
    } else {
      audio.pause();
      state.isPlaying = false;
    }
    renderPlayer();
    updateMiniPlayer();
  } catch (err) {
    console.error('Erreur lors de la bascule lecture/pause:', err);
  }
}

/**
 * Cherche à une position (percentage: 0-100)
 */
function seekTo(percentage) {
  const time = (percentage / 100) * audio.duration;
  audio.currentTime = time;
}

/**
 * Passe devant (15 secondes par défaut)
 */
function skipForward(seconds = 15) {
  audio.currentTime = Math.min(audio.currentTime + seconds, audio.duration);
}

/**
 * Passe derrière (15 secondes par défaut)
 */
function skipBackward(seconds = 15) {
  audio.currentTime = Math.max(audio.currentTime - seconds, 0);
}

/**
 * Chapitre précédent
 */
async function previousChapter() {
  if (!state.currentBook || state.currentEpisodeIndex <= 0) {
    audio.currentTime = 0;
    return;
  }

  const newIndex = state.currentEpisodeIndex - 1;
  await playEpisode(state.currentBook, newIndex);
}

/**
 * Chapitre suivant
 */
async function nextChapter() {
  if (!state.currentBook) return;

  const newIndex = state.currentEpisodeIndex + 1;
  if (newIndex < state.currentBook.episodes.length) {
    await playEpisode(state.currentBook, newIndex);
  } else {
    // Fin du livre
    audio.pause();
    state.isPlaying = false;
    renderPlayer();
    updateMiniPlayer();
    showToast('Fin du livre atteinte');
  }
}

/**
 * Définit la vitesse de lecture
 */
async function setSpeed(speed) {
  audio.playbackRate = speed;
  state.playbackSpeed = speed;
  await saveSetting('playbackSpeed', speed);
  renderPlayer();
  updateMiniPlayer();
}

/**
 * Démarre la minuterie de sommeil
 */
function startSleepTimer(type, minutes) {
  // Annuler le minuteur existant
  if (state.sleepTimer) {
    clearInterval(state.sleepTimer.intervalId);
  }

  let remaining = minutes;

  if (type === 'chapter') {
    // Attendre la fin du chapitre actuel
    state.sleepTimer = {
      type: 'chapter',
      remaining: remaining,
      intervalId: null
    };
    showToast('Minuteur de sommeil: fin du chapitre');
  } else {
    // Compte à rebours en minutes
    state.sleepTimer = {
      type: 'minutes',
      remaining: remaining,
      intervalId: setInterval(() => {
        if (state.sleepTimer) {
          state.sleepTimer.remaining--;

          if (state.sleepTimer.remaining <= 0) {
            audio.pause();
            state.isPlaying = false;
            state.sleepTimer = null;
            renderPlayer();
            updateMiniPlayer();
            showToast('Minuteur de sommeil: fin');
          } else {
            renderPlayer();
          }
        }
      }, 60000) // Mise à jour chaque minute
    };
    showToast(`Minuteur de sommeil: ${minutes} minute(s)`);
  }

  renderPlayer();
}

/**
 * Annule la minuterie de sommeil
 */
function cancelSleepTimer() {
  if (state.sleepTimer) {
    if (state.sleepTimer.intervalId) {
      clearInterval(state.sleepTimer.intervalId);
    }
    state.sleepTimer = null;
    renderPlayer();
    showToast('Minuteur de sommeil annulé');
  }
}

/**
 * Met à jour les métadonnées Media Session
 */
function updateMediaSession() {
  if ('mediaSession' in navigator && state.currentBook) {
    const episode = state.currentBook.episodes[state.currentEpisodeIndex];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: state.currentBook.author,
      album: state.currentBook.title,
      artwork: state.currentBook.coverUrl ? [
        { src: state.currentBook.coverUrl, sizes: '512x512', type: 'image/jpeg' }
      ] : []
    });
  }
}

// ============================================================================
// RENDU DE L'INTERFACE
// ============================================================================

/**
 * Affiche la bibliothèque
 */
async function renderLibrary(books) {
  const bookGrid = document.getElementById('book-grid');
  const loadingSpinner = document.getElementById('library-loading');

  if (!bookGrid) return;

  bookGrid.innerHTML = '';

  for (const book of books) {
    const progress = await getBookProgress(book.id);
    const progressPercent = progress.totalSeconds > 0
      ? Math.round((progress.listenedSeconds / progress.totalSeconds) * 100)
      : 0;

    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.bookId = book.id;

    const coverImg = document.createElement('img');
    coverImg.className = 'book-card-cover';
    coverImg.src = book.coverUrl || '/placeholder.png';
    coverImg.alt = book.title;
    coverImg.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'book-card-info';

    const title = document.createElement('h3');
    title.className = 'book-card-title';
    title.textContent = book.title;

    const author = document.createElement('p');
    author.className = 'book-card-author';
    author.textContent = book.author;

    const meta = document.createElement('p');
    meta.className = 'book-card-meta';
    meta.textContent = `${book.episodes.length} chapitre${book.episodes.length > 1 ? 's' : ''}`;

    const progressBar = document.createElement('div');
    progressBar.className = 'book-card-progress';
    progressBar.style.width = `${progressPercent}%`;

    info.appendChild(title);
    info.appendChild(author);
    info.appendChild(meta);
    info.appendChild(progressBar);

    card.appendChild(coverImg);
    card.appendChild(info);

    card.addEventListener('click', () => {
      navigate('book', { bookId: book.id });
    });

    bookGrid.appendChild(card);
  }

  if (loadingSpinner) {
    loadingSpinner.classList.add('hidden');
  }
}

/**
 * Affiche le détail du livre
 */
async function renderBookDetail(book) {
  state.currentBook = book;

  const cover = document.getElementById('book-cover');
  const title = document.getElementById('book-title');
  const author = document.getElementById('book-author');
  const description = document.getElementById('book-description');
  const meta = document.getElementById('book-meta');
  const chaptersContainer = document.getElementById('chapters-container');
  const headerTitle = document.getElementById('header-title');
  const headerBackBtn = document.getElementById('header-back-btn');
  const playBtn = document.getElementById('book-play-btn');

  if (cover) cover.src = book.coverUrl || '/placeholder.png';
  if (title) title.textContent = book.title;
  if (author) author.textContent = book.author;
  if (description) {
    description.innerHTML = sanitizeHTML(book.description);
    // Rendre le texte expansible
    description.style.maxHeight = '200px';
    description.style.overflow = 'hidden';
  }

  // Métadonnées
  const progress = await getBookProgress(book.id);
  const totalDuration = book.episodes.reduce((sum, ep) => sum + ep.durationSeconds, 0);
  if (meta) {
    meta.textContent = `${book.episodes.length} chapitres • ${formatTime(totalDuration)}`;
  }

  // Afficher le bouton "Reprendre" ou "Écouter"
  const lastEpisode = state.currentEpisodeIndex >= 0 ? state.currentEpisodeIndex : 0;
  const lastProgress = await getProgress(book.id, lastEpisode);
  if (playBtn) {
    playBtn.textContent = lastProgress && lastProgress.currentTime > 0
      ? 'Reprendre'
      : 'Écouter';
  }

  // En-tête
  if (headerTitle) headerTitle.textContent = book.title;
  if (headerBackBtn) headerBackBtn.classList.remove('hidden');

  // Chapitres
  if (chaptersContainer) {
    chaptersContainer.innerHTML = '';

    for (const episode of book.episodes) {
      const episodeProgress = await getProgress(book.id, episode.index);
      const episodeProgressPercent = episodeProgress
        ? Math.round((episodeProgress.currentTime / episodeProgress.duration) * 100)
        : 0;

      const isDownloaded = await isEpisodeDownloaded(book.id, episode.index);

      const chapterItem = document.createElement('div');
      chapterItem.className = 'chapter-item';
      chapterItem.dataset.episodeIndex = episode.index;

      const chapterNumber = document.createElement('div');
      chapterNumber.className = 'chapter-number';
      chapterNumber.textContent = episode.episodeNumber || (episode.index + 1);

      const chapterInfo = document.createElement('div');
      chapterInfo.className = 'chapter-info';

      const chapterTitle = document.createElement('span');
      chapterTitle.className = 'chapter-title';
      chapterTitle.textContent = episode.title;

      const chapterDuration = document.createElement('span');
      chapterDuration.className = 'chapter-duration';
      chapterDuration.textContent = episode.duration;

      chapterInfo.appendChild(chapterTitle);
      chapterInfo.appendChild(chapterDuration);

      const chapterActions = document.createElement('div');
      chapterActions.className = 'chapter-actions';

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'chapter-download-btn';
      downloadBtn.dataset.bookId = book.id;
      downloadBtn.dataset.episodeIndex = episode.index;
      downloadBtn.innerHTML = isDownloaded ? Icons.downloaded : Icons.download;
      downloadBtn.title = isDownloaded ? 'Téléchargé' : 'Télécharger';
      downloadBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await handleDownloadClick(downloadBtn, book.id, episode.index, episode.audioUrl);
      });

      chapterActions.appendChild(downloadBtn);

      const progressBar = document.createElement('div');
      progressBar.className = 'chapter-progress-bar';
      const progressFill = document.createElement('div');
      progressFill.className = 'chapter-progress-fill';
      progressFill.style.width = `${episodeProgressPercent}%`;
      progressBar.appendChild(progressFill);

      chapterItem.appendChild(chapterNumber);
      chapterItem.appendChild(chapterInfo);
      chapterItem.appendChild(chapterActions);
      chapterItem.appendChild(progressBar);

      chapterItem.addEventListener('click', () => {
        playEpisode(book, episode.index);
        navigate('player');
      });

      chaptersContainer.appendChild(chapterItem);
    }
  }
}

/**
 * Affiche le lecteur
 */
async function renderPlayer() {
  if (!state.currentBook) return;

  const episode = state.currentBook.episodes[state.currentEpisodeIndex];
  if (!episode) return;

  const artwork = document.getElementById('player-artwork');
  const bookTitle = document.getElementById('player-book-title');
  const chapterTitle = document.getElementById('player-chapter-title');
  const seekBar = document.getElementById('player-seek-bar');
  const timeCurrent = document.getElementById('player-time-current');
  const timeTotal = document.getElementById('player-time-total');
  const playBtn = document.getElementById('player-play-btn');
  const speedBtn = document.getElementById('player-speed-btn');
  const sleepBtn = document.getElementById('player-sleep-btn');
  const headerTitle = document.getElementById('header-title');

  if (artwork) artwork.src = state.currentBook.coverUrl || '/placeholder.png';
  if (bookTitle) bookTitle.textContent = state.currentBook.title;
  if (chapterTitle) chapterTitle.textContent = episode.title;

  // Barre de recherche
  if (seekBar) {
    const percent = audio.duration > 0
      ? (audio.currentTime / audio.duration) * 100
      : 0;
    seekBar.value = percent;
  }

  // Affichage du temps
  if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
  if (timeTotal) timeTotal.textContent = formatTime(audio.duration);

  // Bouton lecture/pause
  if (playBtn) {
    playBtn.innerHTML = state.isPlaying ? Icons.pause : Icons.play;
    playBtn.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Lecture');
  }

  // Texte de vitesse
  if (speedBtn) {
    speedBtn.textContent = `${state.playbackSpeed}x`;
  }

  // Affichage du minuteur de sommeil
  if (sleepBtn && state.sleepTimer) {
    if (state.sleepTimer.type === 'chapter') {
      sleepBtn.textContent = '⏱ Fin du chapitre';
    } else {
      sleepBtn.textContent = `⏱ ${state.sleepTimer.remaining}min`;
    }
  } else if (sleepBtn) {
    sleepBtn.textContent = '⏱';
  }

  // En-tête
  if (headerTitle) headerTitle.textContent = 'Lecture en cours';
}

/**
 * Met à jour la mini-barre de lecture
 */
function updateMiniPlayer() {
  const miniPlayer = document.getElementById('mini-player');
  if (!miniPlayer) return;

  if (!state.currentBook) {
    miniPlayer.classList.add('hidden');
    document.getElementById('app').classList.remove('has-mini-player');
    return;
  }

  if (state.currentView === 'player') {
    miniPlayer.classList.add('hidden');
    document.getElementById('app').classList.remove('has-mini-player');
    return;
  }

  miniPlayer.classList.remove('hidden');
  document.getElementById('app').classList.add('has-mini-player');

  const episode = state.currentBook.episodes[state.currentEpisodeIndex];
  const miniCover = document.getElementById('mini-cover');
  const miniTitle = document.getElementById('mini-title');
  const miniChapter = document.getElementById('mini-chapter');
  const miniPlayBtn = document.getElementById('mini-play-btn');
  const miniProgressFill = document.getElementById('mini-progress-fill');

  if (miniCover) miniCover.src = state.currentBook.coverUrl || '/placeholder.png';
  if (miniTitle) miniTitle.textContent = state.currentBook.title;
  if (miniChapter) miniChapter.textContent = episode ? episode.title : '';
  if (miniPlayBtn) miniPlayBtn.innerHTML = state.isPlaying ? Icons.pause : Icons.play;
  if (miniProgressFill && audio.duration > 0) {
    const percent = (audio.currentTime / audio.duration) * 100;
    miniProgressFill.style.width = `${percent}%`;
  }
}

/**
 * Affiche la transcription
 */
async function renderTranscript(episode) {
  const transcriptTitle = document.getElementById('transcript-title');
  const transcriptContent = document.getElementById('transcript-content');

  if (transcriptTitle) transcriptTitle.textContent = episode.title;
  if (transcriptContent) {
    transcriptContent.innerHTML = sanitizeHTML(episode.description);
  }
}

/**
 * Affiche les signets
 */
async function renderBookmarks(bookId) {
  const bookmarksList = document.getElementById('bookmarks-list');
  if (!bookmarksList) return;

  const bookmarks = await getBookmarks(bookId);
  bookmarksList.innerHTML = '';

  if (bookmarks.length === 0) {
    bookmarksList.innerHTML = '<p class="no-bookmarks">Aucun signet pour ce livre</p>';
    return;
  }

  for (const bookmark of bookmarks) {
    const book = state.books.find(b => b.id === bookId);
    if (!book) continue;

    const episode = book.episodes[bookmark.episodeIndex];
    if (!episode) continue;

    const item = document.createElement('div');
    item.className = 'bookmark-item';

    const info = document.createElement('div');
    info.className = 'bookmark-info';

    const title = document.createElement('div');
    title.className = 'bookmark-title';
    title.textContent = episode.title;

    const time = document.createElement('div');
    time.className = 'bookmark-time';
    time.textContent = formatTime(bookmark.time);

    info.appendChild(title);
    info.appendChild(time);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'bookmark-delete-btn';
    deleteBtn.innerHTML = Icons.close;
    deleteBtn.addEventListener('click', async () => {
      await deleteBookmark(bookmark.id);
      renderBookmarks(bookId);
      showToast('Signet supprimé');
    });

    item.appendChild(info);
    item.appendChild(deleteBtn);

    item.addEventListener('click', () => {
      playEpisode(book, bookmark.episodeIndex);
      audio.currentTime = bookmark.time;
      navigate('player');
      hideModals();
    });

    bookmarksList.appendChild(item);
  }
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Navigue vers une vue
 */
async function navigate(view, params = {}) {
  state.currentView = view;

  // Ajouter à l'historique si différent
  if (state.navigationHistory[state.navigationHistory.length - 1] !== view) {
    state.navigationHistory.push(view);
    if (state.navigationHistory.length > 20) {
      state.navigationHistory.shift();
    }
  }

  // Masquer toutes les vues
  document.querySelectorAll('.view').forEach(el => {
    el.classList.remove('active');
  });

  // Afficher la vue sélectionnée
  const viewElement = document.getElementById(`view-${view}`);
  if (viewElement) {
    viewElement.classList.add('active');
  }

  // Mettre à jour la nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.view === view) {
      item.classList.add('active');
    }
  });

  // Contenu spécifique à la vue
  const headerBackBtn = document.getElementById('header-back-btn');
  const headerTitle = document.getElementById('header-title');

  switch (view) {
    case 'library':
      if (headerBackBtn) headerBackBtn.classList.add('hidden');
      if (headerTitle) headerTitle.textContent = 'ArtsPo Livres Audio';
      updateMiniPlayer();
      break;

    case 'book':
      const bookId = params.bookId;
      const book = state.books.find(b => b.id === bookId);
      if (book) {
        await renderBookDetail(book);
      }
      if (headerBackBtn) headerBackBtn.classList.remove('hidden');
      updateMiniPlayer();
      break;

    case 'player':
      await renderPlayer();
      if (headerBackBtn) headerBackBtn.classList.remove('hidden');
      if (headerTitle) headerTitle.textContent = 'Lecture en cours';
      if (document.getElementById('mini-player')) {
        document.getElementById('mini-player').classList.add('hidden');
      }
      document.getElementById('app').classList.remove('has-mini-player');
      break;

    case 'transcript':
      if (state.currentBook) {
        const episode = state.currentBook.episodes[state.currentEpisodeIndex];
        if (episode) {
          await renderTranscript(episode);
        }
      }
      break;

    case 'about':
      if (headerBackBtn) headerBackBtn.classList.add('hidden');
      if (headerTitle) headerTitle.textContent = 'À propos';
      updateMiniPlayer();
      break;
  }
}

/**
 * Traite le routage par hash
 */
function handleRoute() {
  const hash = window.location.hash.slice(1);
  const [view, params] = hash.split('?');

  const viewName = view || 'library';
  const queryParams = {};

  if (params) {
    const searchParams = new URLSearchParams(params);
    for (const [key, value] of searchParams) {
      queryParams[key] = value;
    }
  }

  navigate(viewName, queryParams);
}

// ============================================================================
// GESTION DES ÉVÉNEMENTS
// ============================================================================

/**
 * Gère le clic sur le bouton de téléchargement
 */
async function handleDownloadClick(btn, bookId, episodeIndex, audioUrl) {
  const isDownloaded = await isEpisodeDownloaded(bookId, episodeIndex);

  if (isDownloaded) {
    // Supprimer le téléchargement
    await deleteDownloadedEpisode(bookId, episodeIndex);
    btn.innerHTML = Icons.download;
    btn.title = 'Télécharger';
    showToast('Téléchargement supprimé');
  } else {
    // Télécharger
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v6m0 0l-3-3m3 3l3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></svg>';
    btn.title = 'Téléchargement...';
    btn.disabled = true;

    try {
      await downloadEpisode(bookId, episodeIndex, audioUrl);
      btn.innerHTML = Icons.downloaded;
      btn.title = 'Téléchargé';
      showToast('Chapitre téléchargé');
    } catch (err) {
      console.error('Erreur de téléchargement:', err);
      btn.innerHTML = Icons.download;
      btn.title = 'Télécharger';
      showToast('Erreur lors du téléchargement');
    } finally {
      btn.disabled = false;
    }
  }
}

/**
 * Ajoute un signet au moment actuel
 */
async function addCurrentBookmark() {
  if (!state.currentBook) {
    showToast('Aucun livre en lecture');
    return;
  }

  const time = audio.currentTime;
  const episode = state.currentBook.episodes[state.currentEpisodeIndex];

  await addBookmark(state.currentBook.id, state.currentEpisodeIndex, time, `${formatTime(time)}`);
  showToast('Signet ajouté');
}

/**
 * Partage le chapitre actuel
 */
async function shareCurrentEpisode() {
  if (!state.currentBook) return;

  const episode = state.currentBook.episodes[state.currentEpisodeIndex];
  const text = `Lecture: ${episode.title} de ${state.currentBook.title}`;
  const url = window.location.href;

  await shareContent(state.currentBook.title, text, url);
}

/**
 * Partage le livre actuel
 */
async function shareCurrentBook() {
  if (!state.currentBook) return;

  const text = `${state.currentBook.title} par ${state.currentBook.author}`;
  const url = window.location.href;

  await shareContent(state.currentBook.title, text, url);
}

/**
 * Télécharge le chapitre actuel
 */
async function downloadCurrentEpisode() {
  if (!state.currentBook) return;

  const episode = state.currentBook.episodes[state.currentEpisodeIndex];
  const downloadBtn = document.getElementById('player-download-btn');

  if (downloadBtn) {
    await handleDownloadClick(downloadBtn, state.currentBook.id, state.currentEpisodeIndex, episode.audioUrl);
  }
}

/**
 * Lance ou reprend la lecture du livre
 */
async function playOrResumeBook() {
  if (!state.currentBook) return;

  const bookId = state.currentBook.id;
  const lastEpisode = state.currentEpisodeIndex >= 0 ? state.currentEpisodeIndex : 0;
  const lastProgress = await getProgress(bookId, lastEpisode);

  await playEpisode(state.currentBook, lastEpisode);
  navigate('player');
}

/**
 * Gère les options de minuteur de sommeil
 */
function handleSleepOption(minutesStr) {
  if (minutesStr === 'chapter') {
    startSleepTimer('chapter', 0);
  } else {
    const minutes = parseInt(minutesStr, 10);
    startSleepTimer('minutes', minutes);
  }
}

/**
 * Configure tous les écouteurs d'événements
 */
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      navigate(view);
      window.location.hash = view;
    });
  });

  // Bouton retour
  const headerBackBtn = document.getElementById('header-back-btn');
  if (headerBackBtn) {
    headerBackBtn.addEventListener('click', goBack);
  }

  // Contrôles du lecteur
  const playBtn = document.getElementById('player-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', togglePlayPause);
  }

  const prevBtn = document.getElementById('player-prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', previousChapter);
  }

  const nextBtn = document.getElementById('player-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', nextChapter);
  }

  const skipBackBtn = document.getElementById('player-skip-back-btn');
  if (skipBackBtn) {
    skipBackBtn.addEventListener('click', () => skipBackward(15));
  }

  const skipFwdBtn = document.getElementById('player-skip-fwd-btn');
  if (skipFwdBtn) {
    skipFwdBtn.addEventListener('click', () => skipForward(15));
  }

  const seekBar = document.getElementById('player-seek-bar');
  if (seekBar) {
    seekBar.addEventListener('input', (e) => {
      seekTo(parseFloat(e.target.value));
    });
  }

  // Vitesse
  const speedBtn = document.getElementById('player-speed-btn');
  if (speedBtn) {
    speedBtn.addEventListener('click', () => showModal('speed'));
  }

  document.querySelectorAll('.speed-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed);
      setSpeed(speed);
      hideModals();
    });
  });

  // Minuteur de sommeil
  const sleepBtn = document.getElementById('player-sleep-btn');
  if (sleepBtn) {
    sleepBtn.addEventListener('click', () => {
      if (state.sleepTimer) {
        cancelSleepTimer();
      } else {
        showModal('sleep');
      }
    });
  }

  document.querySelectorAll('.sleep-option').forEach(btn => {
    btn.addEventListener('click', () => {
      handleSleepOption(btn.dataset.minutes);
      hideModals();
    });
  });

  // Signets
  const bookmarkBtn = document.getElementById('player-bookmark-btn');
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', addCurrentBookmark);
  }

  const bookmarksOpenBtn = document.getElementById('player-bookmarks-btn');
  if (bookmarksOpenBtn) {
    bookmarksOpenBtn.addEventListener('click', () => {
      if (state.currentBook) {
        renderBookmarks(state.currentBook.id);
        showModal('bookmarks');
      }
    });
  }

  // Transcription
  const transcriptBtn = document.getElementById('player-transcript-btn');
  if (transcriptBtn) {
    transcriptBtn.addEventListener('click', () => {
      navigate('transcript');
    });
  }

  const transcriptCloseBtn = document.getElementById('transcript-close-btn');
  if (transcriptCloseBtn) {
    transcriptCloseBtn.addEventListener('click', () => {
      navigate('player');
    });
  }

  // Partage
  const shareEpisodeBtn = document.getElementById('player-share-ep-btn');
  if (shareEpisodeBtn) {
    shareEpisodeBtn.addEventListener('click', shareCurrentEpisode);
  }

  const shareBookBtn = document.getElementById('book-share-btn');
  if (shareBookBtn) {
    shareBookBtn.addEventListener('click', shareCurrentBook);
  }

  // Téléchargement
  const downloadBtn = document.getElementById('player-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCurrentEpisode);
  }

  // Bouton lecture du livre
  const bookPlayBtn = document.getElementById('book-play-btn');
  if (bookPlayBtn) {
    bookPlayBtn.addEventListener('click', playOrResumeBook);
  }

  // Mini-lecteur
  const miniPlayer = document.getElementById('mini-player');
  if (miniPlayer) {
    miniPlayer.addEventListener('click', () => {
      navigate('player');
      window.location.hash = 'player';
    });
  }

  const miniPlayBtn = document.getElementById('mini-play-btn');
  if (miniPlayBtn) {
    miniPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }

  // Fermeture des modales
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', hideModals);
  }

  const bookmarksCloseBtn = document.getElementById('bookmarks-close-btn');
  if (bookmarksCloseBtn) {
    bookmarksCloseBtn.addEventListener('click', hideModals);
  }

  // Clavier - Espace pour lecture/pause
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && state.currentBook && state.currentView === 'player') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  // Événements audio
  audio.addEventListener('timeupdate', () => {
    const now = Date.now();

    // Mise à jour de l'affichage
    renderPlayer();
    updateMiniPlayer();

    // Sauvegarde de la progression toutes les 5 secondes
    if (now - lastProgressSave > PROGRESS_SAVE_INTERVAL && state.currentBook) {
      lastProgressSave = now;
      saveProgress(
        state.currentBook.id,
        state.currentEpisodeIndex,
        audio.currentTime,
        audio.duration
      );
    }
  });

  audio.addEventListener('ended', () => {
    if (state.sleepTimer && state.sleepTimer.type === 'chapter') {
      // Si minuteur de sommeil "fin du chapitre", pause
      audio.pause();
      state.isPlaying = false;
      state.sleepTimer = null;
      renderPlayer();
      updateMiniPlayer();
      showToast('Minuteur de sommeil: fin du chapitre');
    } else {
      // Sinon, chapitre suivant
      nextChapter();
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    renderPlayer();
  });

  audio.addEventListener('play', () => {
    state.isPlaying = true;
    renderPlayer();
    updateMiniPlayer();
    updateMediaSession();
  });

  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    renderPlayer();
    updateMiniPlayer();
  });

  audio.addEventListener('error', () => {
    console.error('Erreur audio:', audio.error);
    showToast('Erreur lors de la lecture de l\'audio');
    state.isPlaying = false;
    renderPlayer();
  });

  // Sauvegarde de la progression à la fermeture
  window.addEventListener('beforeunload', () => {
    if (state.currentBook) {
      saveProgress(
        state.currentBook.id,
        state.currentEpisodeIndex,
        audio.currentTime,
        audio.duration
      );
    }
  });

  // Gestion des événements Media Session
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', async () => {
      await audio.play();
      state.isPlaying = true;
      renderPlayer();
      updateMiniPlayer();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audio.pause();
      state.isPlaying = false;
      renderPlayer();
      updateMiniPlayer();
    });

    navigator.mediaSession.setActionHandler('previoustrack', previousChapter);
    navigator.mediaSession.setActionHandler('nexttrack', nextChapter);

    navigator.mediaSession.setActionHandler('seekbackward', () => skipBackward(15));
    navigator.mediaSession.setActionHandler('seekforward', () => skipForward(15));
  }
}

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialise l'application
 */
async function init() {
  try {
    // Initialiser la base de données
    await initDB();

    // Configuration des événements
    setupEventListeners();

    // Restaurer les paramètres
    const savedSpeed = await getSetting('playbackSpeed');
    if (savedSpeed) {
      setSpeed(savedSpeed);
    }

    // Charger les flux
    const loadingSpinner = document.getElementById('library-loading');
    if (loadingSpinner) {
      loadingSpinner.classList.remove('hidden');
    }

    state.books = await fetchAndParseFeeds();

    if (state.books.length === 0) {
      showToast('Aucun flux chargé. Vérifiez votre connexion.');
    } else {
      await renderLibrary(state.books);
    }

    // Restaurer l'état de lecture précédent
    const lastBookId = await getSetting('lastBookId');
    const lastEpisodeIndex = await getSetting('lastEpisodeIndex');

    if (lastBookId && lastEpisodeIndex !== null) {
      const book = state.books.find(b => b.id === lastBookId);
      if (book) {
        state.currentBook = book;
        state.currentEpisodeIndex = lastEpisodeIndex;
        updateMiniPlayer();
      }
    }

    // Gestion du routage par hash
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);

    // Navigation initiale
    handleRoute();

    console.log('Application initialisée avec succès');
  } catch (err) {
    console.error('Erreur lors de l\'initialisation:', err);
    showToast('Erreur lors du chargement de l\'application');
  }
}

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker enregistré:', reg.scope))
    .catch(err => console.log('Erreur enregistrement Service Worker:', err));
}

// Lancer l'initialisation au chargement du document
document.addEventListener('DOMContentLoaded', init);
