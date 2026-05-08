// @ts-nocheck
// Legacy migration entry. The interactive cemetery logic was extracted verbatim
// from the inline <script type="module"> in index.html. All Firestore reads/writes
// were replaced with calls to the typed API client (`api`), and real-time updates
// arrive via the `/headstones/stream` SSE endpoint. Firebase is used only for Auth.
import { api, type HeadstoneDTO } from './api/client';
import { openHeadstoneStream } from './realtime/headstoneStream';
import {
  initAuth,
  getCurrentUser,
  onUserChange,
  signInWithGoogle,
  signOutCurrentUser,
} from './auth/firebase';

declare const lucide: any;

// Inizializza Firebase Auth fetchando il config dal backend (GET /config).
// Async: il bottone account si abilita non appena onAuthStateChanged emette.
initAuth().catch((err) => {
  console.error('Init Firebase Auth fallita:', err);
});

// Backend headstone -> shape that the legacy `restoreGrave(el, info)` expects.
// `pet.species` is repurposed as the date label (e.g. "2018-2024") and
// `pet.imageGzipBase64` carries the base64 photo data URL.
function dtoToLegacy(h: HeadstoneDTO) {
  return {
    holeId: `${h.x},${h.y}`,
    name: h.pet.name,
    date: h.pet.species ?? '',
    epitaph: h.epitaph ?? '',
    photo: h.pet.imageGzipBase64 ?? null,
    timestamp: new Date(h.createdAt).getTime(),
    paymentStatus: 'completed',
  };
}

// Register a user as soon as they sign into Firebase, so the backend has
// a matching User row before they ever try to call /payments/checkout.
onUserChange(async (user) => {
  if (!user) return;
  try {
    await api.POST('/auth/session', {});
  } catch (err) {
    console.warn('Failed to register session with backend', err);
  }
});

window.signInWithGoogle = signInWithGoogle;
window.signOutCurrentUser = signOutCurrentUser;
window.getCurrentUser = getCurrentUser;

window.onAccountButton = async function () {
  const user = getCurrentUser();
  if (user) {
    if (confirm(`Sei loggato come ${user.email}.\nVuoi disconnetterti?`)) {
      await signOutCurrentUser();
    }
    return;
  }
  try {
    await signInWithGoogle();
  } catch (err) {
    console.error('Login annullato:', err);
  }
};

onUserChange((user) => {
  const btn = document.getElementById('account-btn');
  if (!btn) return;
  btn.style.display = 'flex';
  if (user) {
    btn.classList.add('signed-in');
    btn.title = `Loggato come ${user.email ?? user.uid}`;
    const icon = btn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', 'log-out');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  } else {
    btn.classList.remove('signed-in');
    btn.title = 'Accedi con Google';
    const icon = btn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', 'log-in');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
});

  // === GLOBALS ===
  let selectedHole = null;
  let gravesData = {};
  let population = 0;
  let zoomLevel = 0.9; // Zoom iniziale ottimale per vedere il tempio e l'area circostante

  const modal = document.getElementById('grave-modal');
  const inpName = document.getElementById('grave-name');
  const inpDate = document.getElementById('grave-date');
  const inpText = document.getElementById('grave-text');
  const inpPhoto = document.getElementById('grave-photo-input');
  const viewport = document.getElementById('viewport');
  const world = document.getElementById('world');
  const viewModal = document.getElementById('view-modal');
  const viewPhoto = document.getElementById('view-photo');
  const viewNoPhotoText = document.getElementById('view-no-photo-text');

  // === SPLASH SCREEN ===
  window.enterSite = function() {
    const splash = document.getElementById('splash-screen');
    
    // Avvia automaticamente la musica quando si entra nel sito
    const backgroundMusic = document.getElementById('background-music');
    const musicBtn = document.getElementById('music-btn');
    
    // Prova ad avviare la musica
    backgroundMusic.play().then(() => {
      // Musica avviata con successo
      musicPlaying = true;
      if (musicBtn) {
        musicBtn.classList.add('playing');
        musicBtn.title = 'Metti in pausa';
        const icon = musicBtn.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', 'volume-2');
          lucide.createIcons();
        }
      }
    }).catch(err => {
      // Autoplay bloccato dal browser - musica rimarrà spenta
      console.log('Autoplay bloccato dal browser:', err);
      musicPlaying = false;
    });
    
    splash.style.transition = 'opacity 0.5s ease';
    splash.style.opacity = '0';
    // Cambia theme-color al verde della mappa per la status bar di Safari iOS
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#7cbd59');
    setTimeout(() => {
      splash.style.display = 'none';
      // Mostra il messaggio di benvenuto stile Pokémon
      document.getElementById('welcome-modal').style.display = 'flex';
    }, 500);
  }

  // === WELCOME MODAL ===
  window.closeWelcome = function() {
    const welcome = document.getElementById('welcome-modal');
    welcome.style.transition = 'opacity 0.3s ease';
    welcome.style.opacity = '0';
    setTimeout(() => {
      welcome.style.display = 'none';
      // Centra la camera sull'origine (tempio)
      camX = 0;
      camY = 0;
      update();
    }, 300);
  }

  // === INFINITE MAP ENGINE ===
  const CELL = 160;
  const HOLE_W = 50;
  const TEMPLE_R = 300;
  const CHUNK = 5;
  // Camera centrata sull'origine (tempio)
  let camX = 0, camY = 0;
  let genChunks = {};
  let holeEls = {};
  let holeBuckets = {};
  const BUCKET_SZ = 200;

  // Tempio al centro (offset per centrare visivamente l'immagine)
  const temple = document.getElementById('temple');
  temple.style.left = '-110px';
  temple.style.top = '-195px';

  // Seeded hash
  function hsh(a, b, s) {
    let h = s | 0;
    h = (h * 2654435761 + a * 374761393) | 0;
    h = (h * 2654435761 + b * 668265263) | 0;
    h = ((h ^ (h >>> 13)) * 1274126177) | 0;
    return (h ^ (h >>> 16)) >>> 0;
  }
  function srand(a, b, s) { return (hsh(a, b, s) % 10000) / 10000; }

  function inTemple(x, y) { return Math.abs(x) < TEMPLE_R && Math.abs(y) < TEMPLE_R; }

  function registerHole(x, y) {
    const bx = Math.floor(x / BUCKET_SZ), by = Math.floor(y / BUCKET_SZ);
    const bk = bx + ',' + by;
    if (!holeBuckets[bk]) holeBuckets[bk] = [];
    holeBuckets[bk].push({ x, y });
  }

  function tooCloseToAnyHole(px, py, minDist) {
    const md2 = minDist * minDist;
    const bx0 = Math.floor((px - minDist) / BUCKET_SZ);
    const bx1 = Math.floor((px + minDist) / BUCKET_SZ);
    const by0 = Math.floor((py - minDist) / BUCKET_SZ);
    const by1 = Math.floor((py + minDist) / BUCKET_SZ);
    for (let by = by0; by <= by1; by++) {
      for (let bx = bx0; bx <= bx1; bx++) {
        const arr = holeBuckets[bx + ',' + by];
        if (!arr) continue;
        for (let i = 0; i < arr.length; i++) {
          const dx = px - arr[i].x, dy = py - arr[i].y;
          if (dx * dx + dy * dy < md2) return true;
        }
      }
    }
    return false;
  }

  let decorBuckets = {};
  const DECOR_BUCKET = 150;

  function registerDecor(x, y, radius) {
    const bx = Math.floor(x / DECOR_BUCKET), by = Math.floor(y / DECOR_BUCKET);
    const bk = bx + ',' + by;
    if (!decorBuckets[bk]) decorBuckets[bk] = [];
    decorBuckets[bk].push({ x, y, r: radius });
  }

  function tooCloseToAnyDecor(px, py, minDist) {
    const bx0 = Math.floor((px - minDist) / DECOR_BUCKET);
    const bx1 = Math.floor((px + minDist) / DECOR_BUCKET);
    const by0 = Math.floor((py - minDist) / DECOR_BUCKET);
    const by1 = Math.floor((py + minDist) / DECOR_BUCKET);
    for (let by = by0; by <= by1; by++) {
      for (let bx = bx0; bx <= bx1; bx++) {
        const arr = decorBuckets[bx + ',' + by];
        if (!arr) continue;
        for (let i = 0; i < arr.length; i++) {
          const dx = px - arr[i].x, dy = py - arr[i].y;
          const need = minDist + arr[i].r;
          if (dx * dx + dy * dy < need * need) return true;
        }
      }
    }
    return false;
  }

  function createPixelFlower(size, colorIdx) {
    const colors = [
      { petal: '#ff6b9d', center: '#ffd93d' },      // Rosa-giallo brillante
      { petal: '#a29bfe', center: '#ffeaa7' },      // Lavanda-giallo
      { petal: '#fd79a8', center: '#ffffff' },      // Rosa chiaro-bianco
      { petal: '#ff7675', center: '#fdcb6e' },      // Rosso corallo-arancione
      { petal: '#74b9ff', center: '#ffeaa7' },      // Azzurro-giallo
      { petal: '#a29bfe', center: '#ffffff' },      // Viola-bianco
      { petal: '#fd79a8', center: '#ffeaa7' },      // Rosa-giallo
      { petal: '#00cec9', center: '#fdcb6e' },      // Turchese-arancione
      { petal: '#ffa502', center: '#ffffff' },      // Arancione-bianco
      { petal: '#ff6348', center: '#ffd93d' },      // Rosso-giallo
      { petal: '#e056fd', center: '#ffeaa7' },      // Magenta-giallo
      { petal: '#55efc4', center: '#ffffff' }       // Verde menta-bianco
    ];
    const c = colors[colorIdx % colors.length];
    const el = document.createElement('div');
    el.className = 'pixel-flower';
    el.style.width = size + 'px';
    el.style.height = (size * 1.6) + 'px';

    // Stelo più robusto e verde
    const stem = document.createElement('div');
    stem.className = 'pf-stem';
    stem.style.width = Math.max(2, Math.floor(size * 0.18)) + 'px';
    stem.style.height = Math.floor(size * 0.75) + 'px';
    stem.style.background = '#4a8c2a'; // Verde più scuro
    el.appendChild(stem);

    // Petali più grandi e arrotondati
    const ps = Math.floor(size * 0.4);
    const positions = [
      { t: 0, l: 50, tx: '-50%', ty: '0' },
      { t: ps, l: 0, tx: '0', ty: '0' },
      { t: ps, l: 100, tx: '-100%', ty: '0' },
      { t: ps * 2, l: 50, tx: '-50%', ty: '0' }
    ];
    for (let p = 0; p < 4; p++) {
      const petal = document.createElement('div');
      petal.style.cssText = 'position:absolute;width:' + ps + 'px;height:' + ps + 'px;background:' + c.petal +
        ';top:' + positions[p].t + 'px;left:' + positions[p].l + '%;transform:translate(' + positions[p].tx + ',' + positions[p].ty +
        ');border-radius:50%;image-rendering:auto;box-shadow:0 1px 2px rgba(0,0,0,0.15);';
      el.appendChild(petal);
    }

    // Centro più grande e con ombra
    const cs = Math.floor(size * 0.3);
    const center = document.createElement('div');
    center.style.cssText = 'position:absolute;width:' + cs + 'px;height:' + cs + 'px;background:' + c.center +
      ';top:' + ps + 'px;left:50%;transform:translateX(-50%);border-radius:50%;image-rendering:auto;z-index:1;box-shadow:inset 0 1px 3px rgba(0,0,0,0.2);';
    el.appendChild(center);

    // Foglia più grande e dettagliata
    const ls = Math.floor(size * 0.35);
    const leaf = document.createElement('div');
    leaf.className = 'pf-leaf';
    leaf.style.width = ls + 'px';
    leaf.style.height = Math.floor(ls * 0.6) + 'px';
    leaf.style.left = (colorIdx % 2 === 0) ? '-2px' : (size - ls + 2) + 'px';
    leaf.style.bottom = Math.floor(size * 0.3) + 'px';
    el.appendChild(leaf);

    return el;
  }

  function canPlaceDecor(x, y, halfSize) {
    let holeDist = halfSize + 45;
    if (holeDist < 90) holeDist = 90;
    if (tooCloseToAnyHole(x, y, holeDist)) return false;
    if (tooCloseToAnyDecor(x, y, halfSize + 10)) return false;
    return true;
  }

  function getHolePos(gx, gy) {
    const prob = srand(gx, gy, 42);
    if (prob > 0.55) return null;
    const wx = gx * CELL, wy = gy * CELL;
    const ox = (srand(gx, gy, 111) - 0.5) * 110;
    const oy = (srand(gx, gy, 222) - 0.5) * 110;
    const wave1 = Math.sin(gx * 0.7 + gy * 0.3) * 20;
    const wave2 = Math.cos(gx * 0.4 - gy * 0.6) * 15;
    const fx = wx + ox + wave1, fy = wy + oy + wave2;
    if (inTemple(fx, fy)) return null;
    return { x: fx, y: fy };
  }

  function ensureHolesRegistered(cx, cy) {
    const rk = 'r' + cx + ',' + cy;
    if (genChunks[rk]) return;
    genChunks[rk] = true;
    const sx = cx * CHUNK, sy = cy * CHUNK;
    const localHoles = [];
    for (let dy = 0; dy < CHUNK; dy++) {
      for (let dx = 0; dx < CHUNK; dx++) {
        const gx = sx + dx, gy = sy + dy;
        const p = getHolePos(gx, gy);
        if (!p) continue;
        let skip = false;
        for (let k = 0; k < localHoles.length; k++) {
          const ddx = p.x - localHoles[k].x, ddy = p.y - localHoles[k].y;
          // Aumentato a 120 pixel per evitare tombe troppo vicine
          if (ddx * ddx + ddy * ddy < 120 * 120) { skip = true; break; }
        }
        if (skip) continue;
        localHoles.push(p);
        registerHole(p.x, p.y);
      }
    }
  }

  function genChunk(cx, cy) {
    const ck = cx + ',' + cy;
    if (genChunks[ck]) return;
    genChunks[ck] = true;

    for (let ay = cy - 1; ay <= cy + 1; ay++)
      for (let ax = cx - 1; ax <= cx + 1; ax++)
        ensureHolesRegistered(ax, ay);

    const sx = cx * CHUNK, sy = cy * CHUNK;
    const chunkPx = CHUNK * CELL;

    // Crea buchi
    for (let dy = 0; dy < CHUNK; dy++) {
      for (let dx = 0; dx < CHUNK; dx++) {
        const gx = sx + dx, gy = sy + dy;
        const p = getHolePos(gx, gy);
        if (!p) continue;

        const hid = gx + ',' + gy;
        if (holeEls[hid]) continue;

        if (tooCloseToAnyHole(p.x, p.y, 64)) {
          let isOwn = false;
          const bx = Math.floor(p.x / BUCKET_SZ), by = Math.floor(p.y / BUCKET_SZ);
          const arr = holeBuckets[bx + ',' + by];
          if (arr) {
            for (let k = 0; k < arr.length; k++) {
              if (Math.abs(arr[k].x - p.x) < 0.1 && Math.abs(arr[k].y - p.y) < 0.1) { isOwn = true; break; }
            }
          }
          if (!isOwn) continue;
        }

        const h = document.createElement('div');
        h.className = 'hole-spot';
        h.dataset.id = hid;
        h.style.left = (p.x - HOLE_W / 2) + 'px';
        h.style.top = (p.y - HOLE_W / 2) + 'px';
        h.addEventListener('click', function(e) { e.stopPropagation(); handleHoleClick(h); });
        h.addEventListener('touchend', function(e) {
          if (!panMoved) { e.preventDefault(); e.stopPropagation(); handleHoleClick(h); }
        });
        world.appendChild(h);
        holeEls[hid] = h;
        if (gravesData[hid]) restoreGrave(h, gravesData[hid]);
      }
    }

    // Decorazioni
    const nd = 5 + (hsh(cx, cy, 9876) % 5);
    for (let i = 0; i < nd; i++) {
      const rx = srand(cx * 100 + i, cy * 200 + i, 3333);
      const ry = srand(cx * 300 + i, cy * 400 + i, 4444);
      const rt = srand(cx * 500 + i, cy * 600 + i, 5555);
      const rf = srand(cx * 700 + i, cy * 800 + i, 6666);
      const rs = srand(cx * 900 + i, cy * 1100 + i, 7777);

      const cwx = cx * chunkPx + rx * chunkPx;
      const cwy = cy * chunkPx + ry * chunkPx;

      const isTree = rt > 0.35;
      const sz = isTree ? 55 + Math.floor(rs * 45) : 25 + Math.floor(rs * 30);
      const halfSz = sz / 2;

      if (Math.abs(cwx) < TEMPLE_R - 30 && Math.abs(cwy) < TEMPLE_R - 30) continue;
      if (!canPlaceDecor(cwx, cwy, halfSz)) continue;

      registerDecor(cwx, cwy, halfSz);

      const el = document.createElement('div');
      el.className = 'decor ' + (isTree ? 'tree' : 'stone');
      el.style.left = (cwx - halfSz) + 'px';
      el.style.top = (cwy - halfSz) + 'px';
      el.style.width = sz + 'px';

      const img = document.createElement('img');
      img.src = isTree ? 'albe_nobg.webp' : 'pietre_nobg.webp';
      img.alt = isTree ? 'Albero' : 'Pietra';
      if (rf > 0.5) img.style.transform = 'scaleX(-1)';
      el.appendChild(img);
      world.appendChild(el);
    }

    // Fiori - MOLTI PIÙ FIORI E PIÙ BELLI
    const nf = 10 + (hsh(cx, cy, 5432) % 9); // Da 10 a 18 fiori per chunk
    for (let i = 0; i < nf; i++) {
      const fx = srand(cx * 150 + i, cy * 250 + i, 8888);
      const fy = srand(cx * 350 + i, cy * 450 + i, 9999);
      const fsz = 10 + Math.floor(srand(cx * 550 + i, cy * 650 + i, 1234) * 14); // Da 10 a 24px
      const fci = hsh(cx + i, cy + i, 4321) % 12; // 12 varietà di colori

      const fwx = cx * chunkPx + fx * chunkPx;
      const fwy = cy * chunkPx + fy * chunkPx;

      // NON sul tempio (area più ampia)
      if (Math.abs(fwx) < TEMPLE_R - 20 && Math.abs(fwy) < TEMPLE_R - 20) continue;

      // NON vicino a tombe/buche (distanza aumentata)
      const flowerHoleDist = 60; // Aumentato da 50 a 60
      if (tooCloseToAnyHole(fwx, fwy, flowerHoleDist)) continue;
      
      // NON vicino ad alberi/sassi (distanza aumentata)
      if (tooCloseToAnyDecor(fwx, fwy, 30)) continue; // Aumentato da 20 a 30

      registerDecor(fwx, fwy, fsz / 2);

      const flower = createPixelFlower(fsz, fci);
      flower.style.left = (fwx - fsz / 2) + 'px';
      flower.style.top = (fwy - fsz) + 'px';
      world.appendChild(flower);
    }
  }

  function update() {
    const vw = viewport.offsetWidth, vh = viewport.offsetHeight;
    const vis = Math.max(vw, vh) * 0.8;
    const x1 = camX - vis, x2 = camX + vis;
    const y1 = camY - vis, y2 = camY + vis;
    const chunkPx = CHUNK * CELL;
    const minCX = Math.floor(x1 / chunkPx), maxCX = Math.floor(x2 / chunkPx);
    const minCY = Math.floor(y1 / chunkPx), maxCY = Math.floor(y2 / chunkPx);
    for (let cy = minCY; cy <= maxCY; cy++)
      for (let cx = minCX; cx <= maxCX; cx++)
        genChunk(cx, cy);
    
    // Il point del mondo (camX, camY) deve essere al centro dello schermo
    // World è già posizionato a 50% 50% del viewport
    // Quindi dobbiamo solo traslarlo di -camX, -camY (moltiplicato per zoom)
    const ox = -camX;
    const oy = -camY;
    
    // Applica transform: translate poi scale
    world.style.transform = 'translate(' + ox + 'px, ' + oy + 'px) scale(' + zoomLevel + ')';
    
    // Muovi anche lo sfondo in sincronia con il mondo
    const bgX = -camX % 40;
    const bgY = -camY % 40;
    viewport.style.backgroundPosition = bgX + 'px ' + bgY + 'px, ' + (bgX + 20) + 'px ' + (bgY + 20) + 'px';
  }

  // Pan
  let panMoved = false, panDown = false, panStartX = 0, panStartY = 0, panCamX = 0, panCamY = 0;
  viewport.addEventListener('mousedown', function(e) {
    if (e.target.closest('.hole-spot') || e.target.closest('.modal-overlay')) return;
    panDown = true; panMoved = false;
    panStartX = e.clientX; panStartY = e.clientY;
    panCamX = camX; panCamY = camY;
  });
  viewport.addEventListener('mousemove', function(e) {
    if (!panDown) return;
    const dx = e.clientX - panStartX, dy = e.clientY - panStartY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) panMoved = true;
    // Muovi la camera nella direzione opposta al trascinamento
    camX = panCamX - dx / zoomLevel; 
    camY = panCamY - dy / zoomLevel;
    update();
  });
  viewport.addEventListener('mouseup', () => { panDown = false; });
  viewport.addEventListener('mouseleave', () => { panDown = false; });

  viewport.addEventListener('touchstart', function(e) {
    if (e.target.closest('.hole-spot')) { panMoved = false; return; }
    if (e.touches.length !== 1) return;
    panDown = true; panMoved = false;
    panStartX = e.touches[0].clientX; panStartY = e.touches[0].clientY;
    panCamX = camX; panCamY = camY;
  });
  viewport.addEventListener('touchmove', function(e) {
    if (!panDown || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - panStartX, dy = e.touches[0].clientY - panStartY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) panMoved = true;
    // Muovi la camera nella direzione opposta al trascinamento
    camX = panCamX - dx / zoomLevel; 
    camY = panCamY - dy / zoomLevel;
    update();
  });
  viewport.addEventListener('touchend', () => { panDown = false; });
  viewport.addEventListener('touchcancel', () => { panDown = false; });

  window.goHome = function() { camX = 0; camY = 0; update(); };

  // Zoom functionality
  const ZOOM_STEP = 0.15;  // Step più piccolo per 3 livelli
  const MIN_ZOOM = 0.45;   // Zoom minimo dopo 3 step (0.9 - 0.15*3 = 0.45)
  const MAX_ZOOM = 2;
  
  window.toggleZoom = function() {
    // Decrementa lo zoom (zoom out)
    zoomLevel -= ZOOM_STEP;
    
    // Se va sotto il minimo (dopo 3 zoom out), torna allo zoom iniziale (0.9)
    if (zoomLevel < MIN_ZOOM) {
      zoomLevel = 0.9;  // Torna allo zoom iniziale
    }
    
    // Applica lo zoom al world
    update();
    
    // Aggiorna il tooltip del bottone
    const zoomBtn = document.getElementById('zoom-btn');
    if (zoomBtn) {
      zoomBtn.title = `Zoom: ${Math.round(zoomLevel * 100)}%`;
    }
  };

  // Music controls
  let musicPlaying = false;
  const backgroundMusic = document.getElementById('background-music');
  const musicBtn = document.getElementById('music-btn');
  
  window.toggleMusic = function() {
    if (musicPlaying) {
      backgroundMusic.pause();
      musicPlaying = false;
      musicBtn.classList.remove('playing');
      musicBtn.title = 'Riproduci musica';
      // Cambia icona a volume-x (muto)
      const icon = musicBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'volume-x');
        lucide.createIcons();
      }
    } else {
      backgroundMusic.play().catch(err => {
        console.log('Autoplay bloccato dal browser:', err);
        alert('Clicca di nuovo per attivare la musica 🎵');
      });
      musicPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.title = 'Metti in pausa';
      // Cambia icona a volume-2 (audio)
      const icon = musicBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'volume-2');
        lucide.createIcons();
      }
    }
  };

  // Handle hole click
  function handleHoleClick(el) {
    if (el.classList.contains('bought')) {
      openViewModal(el);
    } else {
      selectedHole = el;
      modal.style.display = 'flex';
      inpName.value = '';
      inpDate.value = '';
      inpText.value = '';
      inpPhoto.value = '';
      document.getElementById('grave-email').value = '';
    }
  }

  // Crea una Stripe Checkout Session lato backend e reindirizza l'utente.
  // Richiede un utente loggato con Firebase: senza ID token la chiamata risponde 401.
  window.proceedToPayment = async function() {
    if (!selectedHole) return;

    const user = getCurrentUser();
    if (!user) {
      alert('🔐 Per creare un memoriale devi prima accedere con Google.');
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error('Login annullato:', err);
        return;
      }
    }

    const name = inpName.value.trim();
    const date = inpDate.value.trim();
    const epitaph = inpText.value.trim();

    if (!name) { alert("⚠️ Inserisci il nome dell'animale"); return; }
    if (!date) { alert('⚠️ Inserisci le date'); return; }
    if (!epitaph) { alert('⚠️ Inserisci un epitaffio'); return; }

    let photoData = null;
    if (inpPhoto.files && inpPhoto.files[0]) {
      try {
        photoData = await readFileAsDataURL(inpPhoto.files[0]);
        photoData = await compressImage(photoData, 200, 0.7);
      } catch (e) {
        console.error('Errore foto:', e);
      }
    }

    // Coordinate from the selected hole's id ("gx,gy" o "home_xxx").
    const holeId = selectedHole.dataset.id as string;
    let x: number, y: number;
    if (holeId.startsWith('home_')) {
      // Home buckets are mapped to a reserved negative quadrant so they can
      // coexist with the procedural grid.
      const map: Record<string, [number, number]> = {
        home_t1: [-9001, -9001], home_t2: [-9000, -9001], home_t3: [-8999, -9001],
        home_b1: [-9001, -9000], home_b2: [-9000, -9000], home_b3: [-8999, -9000],
      };
      [x, y] = map[holeId] ?? [0, 0];
    } else {
      const [gx, gy] = holeId.split(',').map((v) => parseInt(v, 10));
      x = gx; y = gy;
    }

    try {
      const { data, error } = await api.POST('/payments/checkout', {
        body: {
          x, y,
          epitaph: `${date}\n${epitaph}`,
          pet: {
            name,
            species: date,
            imageGzipBase64: photoData ?? undefined,
            imageMime: photoData ? 'image/jpeg' : undefined,
          },
        },
      });

      if (error || !data) {
        const msg = (error as any)?.message ?? 'Errore inatteso';
        alert(`❌ ${msg}`);
        return;
      }

      // Backend has a PendingHeadstone row keyed by the returned pendingId;
      // remember it so we can display feedback when the user returns from Stripe.
      localStorage.setItem('pendingHeadstoneId', data.pendingId);
      localStorage.setItem('pendingHoleId', holeId);

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Checkout failed', err);
      alert(`❌ Errore checkout: ${err?.message ?? err}`);
    }
  }

  // Funzione helper: dato un holeId, trova o crea il buco nel DOM
  // Per buchi "home_xxx" sono già creati da buildHomeScene.
  // Per buchi "gx,gy" bisogna generare il chunk corrispondente e poi navigare lì.
  function ensureHoleInDOM(holeId) {
    // Se esiste già, ritorna subito
    if (holeEls[holeId]) return holeEls[holeId];

    // Se è un buco home_, dovrebbe già esistere (creato da buildHomeScene)
    if (holeId.startsWith('home_')) {
      console.log('⚠️ Buco home non trovato:', holeId);
      return null;
    }

    // Per buchi di tipo "gx,gy", calcoliamo la posizione e generiamo il chunk
    const parts = holeId.split(',');
    if (parts.length === 2) {
      const gx = parseInt(parts[0]);
      const gy = parseInt(parts[1]);
      if (!isNaN(gx) && !isNaN(gy)) {
        // Calcola in quale chunk si trova
        const chunkCx = Math.floor(gx / CHUNK);
        const chunkCy = Math.floor(gy / CHUNK);
        
        // Genera il chunk (e quelli adiacenti) per creare il buco nel DOM
        genChunk(chunkCx, chunkCy);
        
        // Adesso dovrebbe esistere
        if (holeEls[holeId]) return holeEls[holeId];
        
        // Se non esiste ancora, proviamo a crearlo manualmente alla posizione corretta
        const p = getHolePos(gx, gy);
        if (p) {
          console.log('🔧 Creo buco manualmente per:', holeId, 'a', p.x, p.y);
          const h = document.createElement('div');
          h.className = 'hole-spot';
          h.dataset.id = holeId;
          h.style.left = (p.x - HOLE_W / 2) + 'px';
          h.style.top = (p.y - HOLE_W / 2) + 'px';
          h.addEventListener('click', function(e) { e.stopPropagation(); handleHoleClick(h); });
          h.addEventListener('touchend', function(e) {
            if (!panMoved) { e.preventDefault(); e.stopPropagation(); handleHoleClick(h); }
          });
          world.appendChild(h);
          holeEls[holeId] = h;
          return h;
        }
      }
    }

    console.log('⚠️ Impossibile creare buco per holeId:', holeId);
    return null;
  }

  // Funzione helper: dato un holeId, calcola la posizione pixel nel mondo
  function getHoleWorldPosition(holeId) {
    // Buchi home
    const homePositions = {
      'home_t1': { x: -90, y: -170 },
      'home_t2': { x: 0, y: -200 },
      'home_t3': { x: 90, y: -170 },
      'home_b1': { x: -90, y: 170 },
      'home_b2': { x: 0, y: 200 },
      'home_b3': { x: 90, y: 170 }
    };
    if (homePositions[holeId]) return homePositions[holeId];

    // Buchi chunk "gx,gy"
    const parts = holeId.split(',');
    if (parts.length === 2) {
      const gx = parseInt(parts[0]);
      const gy = parseInt(parts[1]);
      if (!isNaN(gx) && !isNaN(gy)) {
        const p = getHolePos(gx, gy);
        if (p) return p;
      }
    }
    return null;
  }

  // Al ritorno da Stripe la lapide è già stata creata server-side dal webhook
  // (POST /webhooks/stripe). Qui mostriamo solo feedback all'utente: la lapide
  // comparirà sulla mappa via SSE non appena la transazione è confermata.
  window.checkPaymentAndCreateGrave = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const sessionId = urlParams.get('session_id');
    const pendingHoleId = localStorage.getItem('pendingHoleId');

    if (status === 'success' || sessionId) {
      // Centra la camera sul buco prenotato, così quando l'evento SSE arriva
      // l'utente è già nella zona giusta.
      if (pendingHoleId) {
        const holePos = getHoleWorldPosition(pendingHoleId);
        if (holePos) {
          camX = holePos.x;
          camY = holePos.y;
          update();
          ensureHoleInDOM(pendingHoleId);
        }
      }

      localStorage.removeItem('pendingHeadstoneId');
      localStorage.removeItem('pendingHoleId');
      window.history.replaceState({}, document.title, window.location.pathname);

      alert(
        '✅ Pagamento ricevuto!\n🐾 Il memoriale apparirà sulla mappa entro pochi secondi.\n\nGrazie per aver commemorato il tuo amico con noi. ❤️'
      );
    }

    if (status === 'canceled' || urlParams.get('canceled') === 'true') {
      localStorage.removeItem('pendingHeadstoneId');
      localStorage.removeItem('pendingHoleId');
      alert('❌ Pagamento annullato.\nPuoi riprovare quando vuoi.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Funzione per creare una tomba (MANTENUTA per compatibilità, ma ora richiede pagamento)
  window.createGrave = async function() {
    // Questa funzione ora rimanda a proceedToPayment
    alert("💳 Per creare un memoriale è necessario completare il pagamento.\n\nClicca su 'PROCEDI AL PAGAMENTO' per continuare.");
  }

  window.closeModal = function() {
    modal.style.display = 'none';
    selectedHole = null;
  }

  function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = (e) => res(e.target.result);
      r.onerror = (e) => rej(e);
      r.readAsDataURL(file);
    });
  }

  function compressImage(dataURL, maxW, maxQ) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        if (h > maxW) { w = Math.round(w * maxW / h); h = maxW; }
        
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        res(c.toDataURL('image/jpeg', maxQ));
      };
      img.onerror = () => rej(new Error('Image load failed'));
      img.src = dataURL;
    });
  }

  function restoreGrave(el, info) {
    if (!el.classList.contains('bought')) {
      el.classList.add('bought');
      el.innerHTML = '';
      const tomb = document.createElement('div'); 
      tomb.className = 'tombstone';
      const cross = document.createElement('div'); 
      cross.className = 'tomb-cross'; 
      cross.innerHTML = '&#x2764;'; 
      tomb.appendChild(cross);
      
      if (info.photo) {
        const ph = document.createElement('img'); 
        ph.className = 'tomb-photo'; 
        ph.src = info.photo; 
        ph.alt = info.name; 
        ph.loading = 'lazy';
        ph.crossOrigin = 'anonymous';
        ph.onerror = function() { this.style.display = 'none'; };
        tomb.appendChild(ph);
      }
      
      const id = document.createElement('div'); 
      id.className = 'tomb-info';
      const n = document.createElement('div'); 
      n.className = 't-name'; 
      n.innerText = info.name;
      const d = document.createElement('div'); 
      d.className = 't-date'; 
      d.innerText = info.date;
      const ep = document.createElement('div'); 
      ep.className = 't-epitaph'; 
      ep.innerText = info.epitaph;
      id.appendChild(n); 
      id.appendChild(d); 
      id.appendChild(ep);
      tomb.appendChild(id); 
      el.appendChild(tomb);
    }
    el.__graveData = info;
  }

  function openViewModal(el) {
    const data = el.__graveData; 
    if (!data) return;
    
    const holeId = el.dataset.id;
    if (holeId && gravesData[holeId]) {
      el.__graveData = gravesData[holeId];
    }
    
    document.getElementById('view-name').innerText = data.name;
    document.getElementById('view-date').innerText = data.date;
    document.getElementById('view-epitaph').innerText = '"' + data.epitaph + '"';
    
    if (data.photo) { 
      viewPhoto.src = data.photo; 
      viewPhoto.crossOrigin = 'anonymous';
      viewPhoto.onerror = function() { 
        viewPhoto.style.display = 'none'; 
        viewNoPhotoText.style.display = 'block'; 
      };
      viewPhoto.style.display = 'block'; 
      viewNoPhotoText.style.display = 'none'; 
    } else { 
      viewPhoto.style.display = 'none'; 
      viewNoPhotoText.style.display = 'block'; 
    }
    viewModal.style.display = 'flex';
  }

  window.closeViewModal = function() { viewModal.style.display = 'none'; };

  // === SCENA INIZIALE CURATA (intorno al tempio) ===
  // 6 buchi fissi intorno al tempio, alberi ai lati, fiori decorativi
  (function buildHomeScene() {
    // Posizioni fisse dei 6 buchi "vetrina" intorno al tempio
    const fixedHoles = [
      // Sopra il tempio
      { id: 'home_t1', x: -90, y: -170 },
      { id: 'home_t2', x:   0, y: -200 },
      { id: 'home_t3', x:  90, y: -170 },
      // Sotto il tempio
      { id: 'home_b1', x: -90, y:  170 },
      { id: 'home_b2', x:   0, y:  200 },
      { id: 'home_b3', x:  90, y:  170 }
    ];

    for (let i = 0; i < fixedHoles.length; i++) {
      const fh = fixedHoles[i];
      registerHole(fh.x, fh.y);
      if (!holeEls[fh.id]) {
        const h = document.createElement('div');
        h.className = 'hole-spot';
        h.dataset.id = fh.id;
        h.style.left = (fh.x - HOLE_W / 2) + 'px';
        h.style.top = (fh.y - HOLE_W / 2) + 'px';
        h.addEventListener('click', function(e) { e.stopPropagation(); handleHoleClick(h); });
        h.addEventListener('touchend', function(e) {
          if (!panMoved) { e.preventDefault(); e.stopPropagation(); handleHoleClick(h); }
        });
        world.appendChild(h);
        holeEls[fh.id] = h;
        if (gravesData[fh.id]) restoreGrave(h, gravesData[fh.id]);
      }
    }

    // Alberi fissi ai lati del tempio (simmetrici)
    const fixedTrees = [
      { x: -190, y: -80, sz: 80, flip: false },
      { x:  190, y: -80, sz: 75, flip: true },
      { x: -185, y:  80, sz: 70, flip: true },
      { x:  185, y:  80, sz: 72, flip: false }
    ];
    for (let i = 0; i < fixedTrees.length; i++) {
      const ft = fixedTrees[i];
      registerDecor(ft.x, ft.y, ft.sz / 2);
      const el = document.createElement('div');
      el.className = 'decor tree';
      el.style.left = (ft.x - ft.sz / 2) + 'px';
      el.style.top = (ft.y - ft.sz / 2) + 'px';
      el.style.width = ft.sz + 'px';
      const img = document.createElement('img');
      img.src = 'albe_nobg.webp';
      img.alt = 'Albero';
      if (ft.flip) img.style.transform = 'scaleX(-1)';
      el.appendChild(img);
      world.appendChild(el);
    }

    // Pietre decorative
    const fixedStones = [
      { x: -140, y: -230, sz: 35 },
      { x:  140, y: -230, sz: 32 },
      { x: -145, y:  235, sz: 30 },
      { x:  145, y:  235, sz: 33 }
    ];
    for (let i = 0; i < fixedStones.length; i++) {
      const fs = fixedStones[i];
      registerDecor(fs.x, fs.y, fs.sz / 2);
      const el = document.createElement('div');
      el.className = 'decor stone';
      el.style.left = (fs.x - fs.sz / 2) + 'px';
      el.style.top = (fs.y - fs.sz / 2) + 'px';
      el.style.width = fs.sz + 'px';
      const img = document.createElement('img');
      img.src = 'pietre_nobg.webp';
      img.alt = 'Pietra';
      el.appendChild(img);
      world.appendChild(el);
    }

    // Fiori pixel art decorativi
    const fixedFlowers = [
      { x: -120, y: -140, sz: 12, c: 0 },
      { x:  120, y: -140, sz: 11, c: 2 },
      { x: -50, y: -250, sz: 10, c: 1 },
      { x:  50, y: -250, sz: 9, c: 3 },
      { x: -115, y:  145, sz: 11, c: 4 },
      { x:  115, y:  145, sz: 10, c: 5 },
      { x: -55, y:  255, sz: 12, c: 6 },
      { x:  55, y:  255, sz: 11, c: 7 },
      { x: -230, y: -20, sz: 14, c: 1 },
      { x:  230, y: -20, sz: 13, c: 3 },
      { x: -225, y:  25, sz: 12, c: 5 },
      { x:  225, y:  25, sz: 11, c: 2 }
    ];
    for (let i = 0; i < fixedFlowers.length; i++) {
      const ff = fixedFlowers[i];
      registerDecor(ff.x, ff.y, ff.sz / 2);
      const flower = createPixelFlower(ff.sz, ff.c);
      flower.style.left = (ff.x - ff.sz / 2) + 'px';
      flower.style.top = (ff.y - ff.sz) + 'px';
      world.appendChild(flower);
    }
  })();

  // Carica il cimitero dal backend (sostituisce il documento Firestore world/cemetery_free).
  // Il real-time arriva poi via SSE su /headstones/stream.
  let backendDataLoaded = false;
  let onBackendReady: (() => void) | null = null;
  const backendReadyPromise = new Promise<void>((resolve) => {
    onBackendReady = resolve;
  });

  function applyHeadstone(h: HeadstoneDTO) {
    const legacy = dtoToLegacy(h);
    gravesData[legacy.holeId] = legacy;
    const el = ensureHoleInDOM(legacy.holeId);
    if (el) restoreGrave(el, legacy);
  }

  function removeHeadstone(_id: string) {
    // Backend deletes are rare in this UX; rebuild local index by id mapping.
    for (const hid of Object.keys(gravesData)) {
      const el = holeEls[hid];
      if (el && (el as any).__graveData && (el as any).__graveData.id === _id) {
        delete gravesData[hid];
        el.classList.remove('bought');
        el.innerHTML = '';
        delete (el as any).__graveData;
      }
    }
  }

  (async () => {
    try {
      const { data, error } = await api.GET('/headstones', {});
      if (error) throw error;
      const headstones = (data ?? []) as HeadstoneDTO[];
      population = headstones.length;
      headstones.forEach(applyHeadstone);
      console.log('✅ Cimitero caricato dal backend, lapidi:', headstones.length);
    } catch (err) {
      console.error('Errore caricamento cimitero', err);
    } finally {
      backendDataLoaded = true;
      onBackendReady?.();
    }
  })();

  openHeadstoneStream({
    onOpen: () => console.log('📡 SSE /headstones/stream aperto'),
    onCreated: (h) => { population++; applyHeadstone(h); },
    onUpdated: (h) => applyHeadstone(h),
    onDeleted: (id) => { population = Math.max(0, population - 1); removeHeadstone(id); },
    onError: (e) => console.warn('SSE error', e),
  });

  // Verifica al caricamento se stiamo tornando da un pagamento Stripe
  (function checkStripeReturn() {
    // Inizializza Lucide Icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Controlla se stiamo tornando da Stripe
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const isReturningFromStripe = sessionId || urlParams.get('success') === 'true' || urlParams.get('canceled') === 'true';
    
    if (isReturningFromStripe) {
      console.log('� Ritorno da Stripe rilevato, preparo la mappa...');
      
      // Salta la splash screen e vai direttamente alla mappa
      const splash = document.getElementById('splash-screen');
      if (splash) splash.style.display = 'none';
      const welcome = document.getElementById('welcome-modal');
      if (welcome) welcome.style.display = 'none';
      
      // Cambia theme-color al verde della mappa
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', '#7cbd59');
      
      // Avvia la musica
      const backgroundMusic = document.getElementById('background-music');
      const musicBtn = document.getElementById('music-btn');
      if (backgroundMusic) {
        backgroundMusic.play().then(() => {
          musicPlaying = true;
          if (musicBtn) musicBtn.classList.add('playing');
        }).catch(() => {});
      }
      
      // Aspetta che il backend abbia caricato il cimitero (max 8s) e gestisci il ritorno da Stripe.
      const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 8000));
      Promise.race([backendReadyPromise, timeoutPromise]).then(() => {
        console.log('🚀 Backend pronto (o timeout), gestisco ritorno da Stripe...');
        checkPaymentAndCreateGrave();
      });
    }
    
    // Assicura che la vista inizi centrata sul tempio
    camX = 0;
    camY = 0;
    update();
  })();

  // Inizializza la prima vista centrata sul tempio
  camX = 0;
  camY = 0;
  update();
