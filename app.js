const mapEl = document.getElementById('map');

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
    mapEl.appendChild(el);
  }
}

loadBooths().then(renderMap);
