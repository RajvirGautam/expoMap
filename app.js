const mapEl = document.getElementById('map');
const detailsEl = document.getElementById('details');
let selected = null;
let activeCategory = null;
const favourites = new Set(JSON.parse(localStorage.getItem('expomap-favs') || '[]'));
const searchEl = document.getElementById('search');

async function loadBooths(hall = 'booths') {
  const res = await fetch(`data/${hall}.json`);
  if (!res.ok) throw new Error(`Failed to load ${hall}`);
  return res.json();
}

function renderMap(booths) {
  mapEl.innerHTML = '';
  for (const b of booths) {
    const el = document.createElement('button');
    el.className = `booth booth--${b.category}`;
    el.dataset.id = b.id;
    el.dataset.category = b.category;
    if (favourites.has(b.id)) el.classList.add('is-fav');
    el.dataset.search = `${b.id} ${b.name} ${b.category}`.toLowerCase();
    el.textContent = b.id;
    el.title = b.name;
    el.setAttribute('aria-label', `${b.name}, booth ${b.id}`);
    el.style.gridColumn = `${b.col} / span ${b.w}`;
    el.style.gridRow = `${b.row} / span ${b.h}`;
    el.addEventListener('click', () => selectBooth(b, el));
    mapEl.appendChild(el);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function toggleFavourite(id) {
  if (favourites.has(id)) favourites.delete(id);
  else favourites.add(id);
  localStorage.setItem('expomap-favs', JSON.stringify([...favourites]));
}

function isOpenNow(booth, now = new Date()) {
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= toMins(booth.open) && mins < toMins(booth.close);
}

function selectBooth(booth, el) {
  if (selected) selected.classList.remove('is-selected');
  selected = el;
  el.classList.add('is-selected');
  history.replaceState(null, '', `#${booth.id}`);
  detailsEl.innerHTML = `
    <h2>${escapeHtml(booth.name)}</h2>
    <p class="details__meta">Booth ${escapeHtml(booth.id)} &middot; ${escapeHtml(booth.category)}</p>
    ${booth.open ? `<p class="details__hours">${escapeHtml(booth.open)}–${escapeHtml(booth.close)} <span class="status ${isOpenNow(booth) ? 'status--open' : 'status--closed'}">${isOpenNow(booth) ? 'Open now' : 'Closed'}</span></p>` : ''}
    ${booth.desc ? `<p class="details__desc">${escapeHtml(booth.desc)}</p>` : ''}
  `;

  const favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'fav-btn';
  const paint = () => {
    const saved = favourites.has(booth.id);
    favBtn.textContent = saved ? '★ Saved' : '☆ Save booth';
    el.classList.toggle('is-fav', saved);
  };
  favBtn.addEventListener('click', () => {
    toggleFavourite(booth.id);
    paint();
  });
  paint();
  detailsEl.appendChild(favBtn);
}

function filterBooths(query) {
  const q = query.trim().toLowerCase();
  for (const el of mapEl.querySelectorAll('.booth')) {
    const matchText = !q || el.dataset.search.includes(q);
    const matchCategory = !activeCategory || el.dataset.category === activeCategory;
    el.classList.toggle('is-dimmed', !(matchText && matchCategory));
  }
}

searchEl.addEventListener('input', (e) => filterBooths(e.target.value));

searchEl.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchEl.value = '';
    filterBooths('');
    searchEl.blur();
  }
  if (e.key === 'Enter') {
    const first = [...mapEl.querySelectorAll('.booth')].find((el) => !el.classList.contains('is-dimmed'));
    if (first) first.click();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchEl) {
    e.preventDefault();
    searchEl.focus();
  }
});

for (const btn of document.querySelectorAll('.legend__item')) {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.category;
    activeCategory = activeCategory === cat ? null : cat;
    for (const other of document.querySelectorAll('.legend__item')) {
      other.classList.toggle('is-active', other.dataset.category === activeCategory);
    }
    filterBooths(searchEl.value);
  });
}

let cell = Number(localStorage.getItem('expomap-zoom')) || 64;

function setZoom(next) {
  cell = Math.min(96, Math.max(40, next));
  mapEl.style.setProperty('--cell', `${cell}px`);
  localStorage.setItem('expomap-zoom', cell);
}

document.getElementById('zoom-in').addEventListener('click', () => setZoom(cell + 8));
document.getElementById('zoom-out').addEventListener('click', () => setZoom(cell - 8));
setZoom(cell);

document.getElementById('clear').addEventListener('click', () => {
  searchEl.value = '';
  activeCategory = null;
  for (const btn of document.querySelectorAll('.legend__item')) btn.classList.remove('is-active');
  filterBooths('');
});

const hallEl = document.getElementById('hall');

hallEl.addEventListener('change', async () => {
  selected = null;
  detailsEl.innerHTML = '<p class="details__empty">Select a booth to see details.</p>';
  renderMap(await loadBooths(hallEl.value));
  filterBooths(searchEl.value);
});

const themeBtn = document.getElementById('theme');
const savedTheme = localStorage.getItem('expomap-theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

themeBtn.addEventListener('click', () => {
  const isDark = document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const next = isDark ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('expomap-theme', next);
});

function openFromHash(booths) {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const booth = booths.find((b) => b.id === id);
  const el = mapEl.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (booth && el) selectBooth(booth, el);
}

mapEl.innerHTML = '<p class="map__status">Loading booths…</p>';
loadBooths()
  .then((booths) => {
    renderMap(booths);
    openFromHash(booths);
  })
  .catch(() => {
    mapEl.innerHTML = '<p class="map__status">Could not load booths. Refresh to try again.</p>';
  });
