const mapEl = document.getElementById('map');
const detailsEl = document.getElementById('details');
let selected = null;

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

loadBooths().then(renderMap);
