const mapEl = document.getElementById('map');
const detailsEl = document.getElementById('details');
let selected = null;
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
    el.dataset.search = `${b.id} ${b.name} ${b.category}`.toLowerCase();
    el.textContent = b.id;
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
  detailsEl.innerHTML = `
    <h2>${booth.name}</h2>
    <p class="details__meta">Booth ${booth.id} &middot; ${booth.category}</p>
  `;
}

function filterBooths(query) {
  const q = query.trim().toLowerCase();
  for (const el of mapEl.children) {
    const match = !q || el.dataset.search.includes(q);
    el.classList.toggle('is-dimmed', !match);
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

loadBooths().then(renderMap);
