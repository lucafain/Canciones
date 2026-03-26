const STORAGE_KEYS = {
  history: 'lyricai_history_v1',
  device: 'lyricai_device_mode_v1',
};

const app = document.getElementById('app');
const form = document.getElementById('lyricsForm');
const titleInput = document.getElementById('titleInput');
const artistInput = document.getElementById('artistInput');
const lyricsOutput = document.getElementById('lyricsOutput');
const iaMessage = document.getElementById('iaMessage');
const songHeader = document.getElementById('songHeader');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');
const deviceDialog = document.getElementById('deviceDialog');
const deviceModeTag = document.getElementById('deviceModeTag');

function sanitize(text) {
  return text.trim().replace(/\s+/g, ' ');
}

function getHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.history);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

function updateIaStatus(message, tone = 'normal') {
  const prefixByTone = {
    ok: '✅',
    loading: '🧠',
    error: '⚠️',
    normal: '🎵',
  };
  iaMessage.textContent = `${prefixByTone[tone] || '🎵'} ${message}`;
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<li class="history-item">Sin búsquedas guardadas todavía.</li>';
    return;
  }

  history.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';

    const meta = document.createElement('span');
    meta.textContent = `${item.title} — ${item.artist}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-secondary';
    btn.textContent = 'Repetir';

    btn.addEventListener('click', () => {
      titleInput.value = item.title;
      artistInput.value = item.artist;
      form.requestSubmit();
    });

    li.append(meta, btn);
    historyList.appendChild(li);
  });
}

function pushHistory(title, artist) {
  const history = getHistory();
  const deduped = history.filter((item) => item.title !== title || item.artist !== artist);
  deduped.unshift({ title, artist, date: new Date().toISOString() });
  saveHistory(deduped.slice(0, 10));
  renderHistory();
}

function applyDeviceMode(mode) {
  app.classList.remove('phone', 'pc');
  if (mode === 'phone' || mode === 'pc') {
    app.classList.add(mode);
    localStorage.setItem(STORAGE_KEYS.device, mode);
  }
  const labels = {
    phone: 'Modo: teléfono (vertical)',
    pc: 'Modo: PC (horizontal)',
  };
  deviceModeTag.textContent = labels[mode] || 'Modo: automático';
}

function setupDeviceMode() {
  const rememberedMode = localStorage.getItem(STORAGE_KEYS.device);
  if (rememberedMode === 'phone' || rememberedMode === 'pc') {
    applyDeviceMode(rememberedMode);
    return;
  }

  if (typeof deviceDialog.showModal === 'function') {
    deviceDialog.showModal();
    deviceDialog.addEventListener('close', () => {
      const selectedMode = deviceDialog.returnValue;
      applyDeviceMode(selectedMode);
      updateIaStatus(
        selectedMode === 'phone'
          ? 'Listo, optimicé todo para teléfono en formato vertical.'
          : 'Listo, optimicé todo para PC en formato horizontal.',
        'ok'
      );
    });
    return;
  }

  const inferred = window.matchMedia('(max-width: 768px)').matches ? 'phone' : 'pc';
  applyDeviceMode(inferred);
}

async function fetchLyrics(artist, title) {
  const endpoint = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error('No se encontró una letra completa para esa combinación.');
  }

  const data = await response.json();

  if (!data.lyrics || data.lyrics.length < 3) {
    throw new Error('La API no devolvió una letra válida.');
  }

  return data.lyrics;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = sanitize(titleInput.value);
  const artist = sanitize(artistInput.value);

  if (!title || !artist) {
    updateIaStatus('Necesito título y artista para buscar.', 'error');
    return;
  }

  updateIaStatus(`Estoy buscando la letra de “${title}” por ${artist}...`, 'loading');
  songHeader.textContent = `${title} — ${artist}`;
  lyricsOutput.textContent = 'Buscando letra...';

  try {
    const lyrics = await fetchLyrics(artist, title);
    lyricsOutput.textContent = lyrics;
    pushHistory(title, artist);
    updateIaStatus('Encontré la letra. Si querés, buscá otra canción.', 'ok');
  } catch (error) {
    lyricsOutput.textContent = 'No se pudo obtener la letra completa de esta canción.';
    updateIaStatus(error.message, 'error');
  }
});

clearHistory.addEventListener('click', () => {
  saveHistory([]);
  renderHistory();
  updateIaStatus('Historial limpiado.', 'ok');
});

setupDeviceMode();
renderHistory();
