const mapEl = document.getElementById('map');
const detailsEl = document.getElementById('details');
let selected = null;
let activeCategory = null;
const searchEl = document.getElementById('search');

async function loadBooths() {
  const res = await fetch('data/booths.json');
  return res.json();
}

function renderMap(booths) {
  mapEl.innerHTML = '';
  for (const b of booths) {
    const el = document.createElement('button');
    el.className = `booth booth--${b.category}`;
    el.dataset.id = b.id;
    el.dataset.category = b.category;
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

function selectBooth(booth, el) {
  if (selected) selected.classList.remove('is-selected');
  selected = el;
  el.classList.add('is-selected');
  history.replaceState(null, '', `#${booth.id}`);
  detailsEl.innerHTML = `
    <h2>${booth.name}</h2>
    <p class="details__meta">Booth ${booth.id} &middot; ${booth.category}</p>
    ${booth.desc ? `<p class="details__desc">${booth.desc}</p>` : ''}
  `;
}

function filterBooths(query) {
  const q = query.trim().toLowerCase();
  for (const el of mapEl.children) {
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
    const first = [...mapEl.children].find((el) => !el.classList.contains('is-dimmed'));
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

loadBooths().then((booths) => {
  renderMap(booths);
  openFromHash(booths);
});
