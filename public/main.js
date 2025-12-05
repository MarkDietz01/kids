const childNameInput = document.getElementById('childName');
const saveNameBtn = document.getElementById('saveName');
const savedName = document.getElementById('savedName');
const refreshChildBtn = document.getElementById('refreshChild');
const childProgress = document.getElementById('childProgress');

let currentChild = '';
let childToken = '';

function generateToken() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function loadIdentity() {
  const storedName = localStorage.getItem('kd_child');
  const storedToken = localStorage.getItem('kd_child_token');
  if (storedName) {
    currentChild = storedName;
    childNameInput.value = storedName;
  }
  if (storedToken) {
    childToken = storedToken;
  } else {
    childToken = generateToken();
    localStorage.setItem('kd_child_token', childToken);
  }
  savedName.textContent = currentChild ? `Huidig kind: ${currentChild}` : 'Geen naam opgeslagen';
}

function setChildName(name) {
  currentChild = name;
  localStorage.setItem('kd_child', name);
  if (!childToken) {
    childToken = generateToken();
    localStorage.setItem('kd_child_token', childToken);
  }
  savedName.textContent = name ? `Huidig kind: ${name}` : 'Geen naam opgeslagen';
}

saveNameBtn.addEventListener('click', () => {
  setChildName(childNameInput.value.trim());
});

async function saveProgress(activity, score, details) {
  if (!currentChild) {
    alert('Vul eerst een naam in.');
    return;
  }

  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childName: currentChild, childToken, activity, score, details })
    });
  } catch (error) {
    console.error('Kon progressie niet wegschrijven', error);
    alert('Kan nu geen verbinding maken met de server. Probeer later opnieuw.');
  }
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Kleuren Splash
const colors = [
  { name: 'rood', hex: '#ed4245' },
  { name: 'blauw', hex: '#5865f2' },
  { name: 'geel', hex: '#f0b232' },
  { name: 'groen', hex: '#3ba55c' }
];

const colorPrompt = document.getElementById('colorPrompt');
const colorStart = document.getElementById('colorStart');
const colorOptions = document.getElementById('colorOptions');
const colorFeedback = document.getElementById('colorFeedback');

function startColorRound() {
  const target = pickRandom(colors);
  colorPrompt.textContent = `Welke kleur is ${target.name}?`;
  colorOptions.innerHTML = '';
  colorFeedback.textContent = '';

  colors.forEach((color) => {
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.textContent = color.name.toUpperCase();
    btn.style.background = color.hex;
    btn.addEventListener('click', () => {
      const correct = color.name === target.name;
      colorFeedback.textContent = correct ? 'Goed gedaan! 🌟' : 'Probeer het opnieuw!';
      saveProgress('Kleuren Splash', correct ? 1 : 0, { target: target.name, gekozen: color.name });
    });
    colorOptions.appendChild(btn);
  });
}

colorStart.addEventListener('click', startColorRound);

// Vormen Jacht
const shapes = [
  { name: 'cirkel', emoji: '⚪' },
  { name: 'vierkant', emoji: '🟥' },
  { name: 'driehoek', emoji: '🔺' },
  { name: 'ster', emoji: '⭐' }
];

const shapePrompt = document.getElementById('shapePrompt');
const shapeStart = document.getElementById('shapeStart');
const shapeOptions = document.getElementById('shapeOptions');
const shapeFeedback = document.getElementById('shapeFeedback');

function startShapeRound() {
  const target = pickRandom(shapes);
  shapePrompt.textContent = `Welke vorm past bij ${target.emoji}?`;
  shapeOptions.innerHTML = '';
  shapeFeedback.textContent = '';

  shapes.forEach((shape) => {
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.textContent = `${shape.emoji} ${shape.name}`;
    btn.addEventListener('click', () => {
      const correct = shape.name === target.name;
      shapeFeedback.textContent = correct ? 'Yes! Je hebt de juiste vorm.' : 'Oops, probeer nog eens!';
      saveProgress('Vormen Jacht', correct ? 1 : 0, { target: target.name, gekozen: shape.name });
    });
    shapeOptions.appendChild(btn);
  });
}

shapeStart.addEventListener('click', startShapeRound);

// Tel Tuin
const countPrompt = document.getElementById('countPrompt');
const countStart = document.getElementById('countStart');
const countOptions = document.getElementById('countOptions');
const countFeedback = document.getElementById('countFeedback');

function flowerRow(amount) {
  return Array.from({ length: amount })
    .map(() => '🌸')
    .join(' ');
}

function startCountRound() {
  const amount = Math.floor(Math.random() * 5) + 1;
  countPrompt.textContent = `Hoeveel bloemen zie je? ${flowerRow(amount)}`;
  countOptions.innerHTML = '';
  countFeedback.textContent = '';

  [amount - 1, amount, amount + 1, amount + 2].forEach((val) => {
    if (val <= 0) return;
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.textContent = val.toString();
    btn.addEventListener('click', () => {
      const correct = val === amount;
      countFeedback.textContent = correct ? 'Knap geteld! 🎉' : 'Dat is het nog niet.';
      saveProgress('Tel Tuin', correct ? 1 : 0, { juisteAantal: amount, gekozen: val });
    });
    countOptions.appendChild(btn);
  });
}

countStart.addEventListener('click', startCountRound);

// Zoekplaat
const zoekUpload = document.getElementById('zoekplaatUpload');
const zoekCanvas = document.getElementById('zoekCanvas');
const zoekCtx = zoekCanvas.getContext('2d');
const zoekItemName = document.getElementById('zoekItemName');
const zoekSensitivity = document.getElementById('zoekSensitivity');
const zoekSensitivityLabel = document.getElementById('zoekSensitivityLabel');
const zoekMarkMode = document.getElementById('zoekMarkMode');
const zoekReset = document.getElementById('zoekReset');
const zoekStatus = document.getElementById('zoekStatus');
const zoekTargetsList = document.getElementById('zoekTargetsList');
const zoekCardTitle = document.getElementById('zoekCardTitle');
const zoekCardSelect = document.getElementById('zoekCardSelect');
const zoekSaveCard = document.getElementById('zoekSaveCard');
const zoekLoadCard = document.getElementById('zoekLoadCard');
const zoekRefreshCards = document.getElementById('zoekRefreshCards');
const zoekCardStatus = document.getElementById('zoekCardStatus');
const zoekEditMode = document.getElementById('zoekEditMode');
const zoekAdminKey = document.getElementById('zoekAdminKey');

let zoekImage = null;
let zoekTargets = [];
let pendingLabel = '';
let pendingRadius = Number(zoekSensitivity.value);
let activeCardId = null;
let activitiesCache = [];
let draggingTarget = null;

function setZoekStatus(text) {
  zoekStatus.textContent = text;
}

function setZoekCardStatus(text) {
  zoekCardStatus.textContent = text;
}

function drawZoekplaat() {
  if (!zoekImage) return;
  const width = zoekCanvas.parentElement.clientWidth || 960;
  const ratio = zoekImage.height / zoekImage.width;
  zoekCanvas.width = width;
  zoekCanvas.height = width * ratio;
  zoekCtx.clearRect(0, 0, zoekCanvas.width, zoekCanvas.height);
  zoekCtx.drawImage(zoekImage, 0, 0, zoekCanvas.width, zoekCanvas.height);

  zoekTargets.forEach((target) => {
    const x = target.x * zoekCanvas.width;
    const y = target.y * zoekCanvas.height;
    zoekCtx.beginPath();
    zoekCtx.arc(x, y, target.radius, 0, Math.PI * 2);
    zoekCtx.strokeStyle = target.found ? '#3ba55c' : '#f0b232';
    zoekCtx.lineWidth = 3;
    zoekCtx.stroke();
    zoekCtx.fillStyle = 'rgba(0,0,0,0.5)';
    zoekCtx.fillRect(x - 50, y - 14, 100, 24);
    zoekCtx.fillStyle = '#fff';
    zoekCtx.font = 'bold 14px Nunito, sans-serif';
    zoekCtx.textAlign = 'center';
    zoekCtx.fillText(target.label, x, y + 4);
  });
}

function updateTargetsList() {
  if (!zoekTargets.length) {
    zoekTargetsList.textContent = 'Nog geen zoekdoelen toegevoegd.';
    return;
  }
  zoekTargetsList.innerHTML = '';
  zoekTargets.forEach((t, idx) => {
    const row = document.createElement('div');
    row.className = 'target-row';
    const meta = document.createElement('div');
    meta.textContent = `${idx + 1}. ${t.label} • radius ${t.radius}px • ${t.found ? 'gevonden' : 'nog zoeken'}`;
    const actions = document.createElement('div');
    actions.className = 'actions';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn chip ghost';
    removeBtn.textContent = 'Verwijder punt';
    removeBtn.addEventListener('click', () => {
      zoekTargets.splice(idx, 1);
      updateTargetsList();
      drawZoekplaat();
      setZoekStatus('Punt verwijderd.');
    });
    actions.appendChild(removeBtn);
    row.appendChild(meta);
    row.appendChild(actions);
    zoekTargetsList.appendChild(row);
  });
}

function findTargetAt(xPx, yPx) {
  return zoekTargets.find((t) => Math.hypot(xPx - t.x * zoekCanvas.width, yPx - t.y * zoekCanvas.height) <= t.radius);
}

function renderCardSelect() {
  zoekCardSelect.innerHTML = '';
  if (!activitiesCache.length) {
    const opt = document.createElement('option');
    opt.textContent = 'Geen opgeslagen kaarten';
    opt.value = '';
    zoekCardSelect.appendChild(opt);
    return;
  }
  activitiesCache
    .filter((a) => a.kind === 'zoekplaat')
    .forEach((act) => {
      const opt = document.createElement('option');
      opt.value = act.id;
      opt.textContent = `${act.title} (#${act.id})`;
      zoekCardSelect.appendChild(opt);
    });
}

async function refreshActivities() {
  try {
    const res = await fetch('/api/activities');
    activitiesCache = await res.json();
    renderCardSelect();
    setZoekCardStatus('Kaartlijst bijgewerkt.');
  } catch (error) {
    console.error('Kon activiteiten niet laden', error);
    setZoekCardStatus('Kon de kaarten niet ophalen. Controleer de server.');
  }
}

function hydrateCard(card) {
  if (!card?.data?.imageData) return;
  const img = new Image();
  img.onload = () => {
    zoekImage = img;
    zoekTargets = (card.data.targets || []).map((t) => ({ ...t, found: false }));
    activeCardId = card.id;
    zoekCardTitle.value = card.title;
    drawZoekplaat();
    updateTargetsList();
    setZoekStatus(`Kaart "${card.title}" geladen. Je kunt nu spelen of bewerken.`);
  };
  img.src = card.data.imageData;
}

function getAdminKey() {
  return zoekAdminKey.value || localStorage.getItem('kd_admin_key') || '';
}

async function saveCard() {
  if (!zoekImage) {
    setZoekCardStatus('Upload eerst een plaat om op te slaan.');
    return;
  }
  const adminKey = getAdminKey();
  if (!adminKey) {
    setZoekCardStatus('Vul je admin sleutel in om op te slaan.');
    return;
  }
  const payload = {
    id: activeCardId,
    title: zoekCardTitle.value.trim() || 'Mijn zoekkaart',
    kind: 'zoekplaat',
    data: {
      imageData: zoekImage.src,
      targets: zoekTargets,
    },
  };

  try {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      setZoekCardStatus('Admin sleutel ongeldig.');
      return;
    }
    const data = await res.json();
    activeCardId = data.id;
    localStorage.setItem('kd_admin_key', adminKey);
    setZoekCardStatus('Kaart opgeslagen!');
    refreshActivities();
  } catch (error) {
    console.error('Kon kaart niet opslaan', error);
    setZoekCardStatus('Opslaan mislukt. Probeer opnieuw.');
  }
}

function loadSelectedCard() {
  const id = Number(zoekCardSelect.value);
  if (!id) {
    setZoekCardStatus('Geen kaart geselecteerd.');
    return;
  }
  const card = activitiesCache.find((c) => c.id === id);
  if (!card) {
    setZoekCardStatus('Kon kaart niet vinden.');
    return;
  }
  hydrateCard(card);
}

zoekUpload.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      zoekImage = img;
      zoekTargets = [];
      drawZoekplaat();
      updateTargetsList();
      setZoekStatus('Klik "Markeer positie" en geef aan wat je moet zoeken.');
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

zoekSensitivity.addEventListener('input', (e) => {
  pendingRadius = Number(e.target.value);
  zoekSensitivityLabel.textContent = `Radius: ${pendingRadius}px`;
});

zoekMarkMode.addEventListener('click', () => {
  if (!zoekImage) {
    setZoekStatus('Upload eerst een zoekplaat.');
    return;
  }
  if (!zoekItemName.value.trim()) {
    setZoekStatus('Vul eerst in wat er gezocht moet worden.');
    return;
  }
  pendingLabel = zoekItemName.value.trim();
  setZoekStatus(`Klik op de plek voor "${pendingLabel}" (radius ${pendingRadius}px).`);
});

zoekReset.addEventListener('click', () => {
  zoekImage = null;
  zoekTargets = [];
  zoekCanvas.width = zoekCanvas.height = 0;
  zoekTargetsList.textContent = '';
  setZoekStatus('Upload eerst een plaat en vul het zoekdoel in.');
  activeCardId = null;
});

zoekCanvas.addEventListener('click', (e) => {
  if (!zoekImage) {
    setZoekStatus('Upload eerst een zoekplaat.');
    return;
  }

  const rect = zoekCanvas.getBoundingClientRect();
  const xPx = e.clientX - rect.left;
  const yPx = e.clientY - rect.top;
  const xNorm = xPx / zoekCanvas.width;
  const yNorm = yPx / zoekCanvas.height;

  if (zoekEditMode.checked) {
    const hit = findTargetAt(xPx, yPx);
    if (hit) {
      setZoekStatus(`Versleep "${hit.label}" naar de juiste plek.`);
    } else {
      setZoekStatus('Klik op een bestaand punt om te verplaatsen.');
    }
    return;
  }

  if (pendingLabel) {
    zoekTargets.push({ label: pendingLabel, radius: pendingRadius, x: xNorm, y: yNorm, found: false });
    pendingLabel = '';
    updateTargetsList();
    drawZoekplaat();
    setZoekStatus('Doel opgeslagen. Klik op het doek om te controleren of kinderen het vinden.');
    return;
  }

  const hit = zoekTargets.find((t) => !t.found && Math.hypot(xPx - t.x * zoekCanvas.width, yPx - t.y * zoekCanvas.height) <= t.radius);
  if (hit) {
    hit.found = true;
    drawZoekplaat();
    updateTargetsList();
    setZoekStatus(`Yes! ${hit.label} gevonden.`);
    saveProgress('Zoekplaat', 1, { label: hit.label, radius: hit.radius });
  } else {
    setZoekStatus('Nog niet raak, probeer dichterbij.');
    saveProgress('Zoekplaat', 0, { pogingX: xNorm.toFixed(2), pogingY: yNorm.toFixed(2) });
  }
});

zoekCanvas.addEventListener('mousedown', (e) => {
  if (!zoekImage || !zoekEditMode.checked) return;
  const rect = zoekCanvas.getBoundingClientRect();
  const xPx = e.clientX - rect.left;
  const yPx = e.clientY - rect.top;
  draggingTarget = findTargetAt(xPx, yPx) || null;
});

window.addEventListener('mousemove', (e) => {
  if (!draggingTarget || !zoekEditMode.checked || !zoekImage) return;
  const rect = zoekCanvas.getBoundingClientRect();
  const xNorm = (e.clientX - rect.left) / zoekCanvas.width;
  const yNorm = (e.clientY - rect.top) / zoekCanvas.height;
  draggingTarget.x = Math.min(1, Math.max(0, xNorm));
  draggingTarget.y = Math.min(1, Math.max(0, yNorm));
  drawZoekplaat();
});

window.addEventListener('mouseup', () => {
  if (draggingTarget) {
    setZoekStatus(`Punt "${draggingTarget.label}" verplaatst.`);
    draggingTarget = null;
    updateTargetsList();
  }
});

zoekEditMode.addEventListener('change', (e) => {
  if (e.target.checked) {
    setZoekStatus('Bewerk-modus actief: klik en versleep punten om ze te verplaatsen.');
  } else {
    setZoekStatus('Speel-modus: klik op de plaat om te zoeken.');
  }
});

zoekSaveCard.addEventListener('click', saveCard);
zoekLoadCard.addEventListener('click', loadSelectedCard);
zoekRefreshCards.addEventListener('click', refreshActivities);

const storedAdminKey = localStorage.getItem('kd_admin_key');
if (storedAdminKey) {
  zoekAdminKey.value = storedAdminKey;
}

refreshActivities();

async function loadChildProgress() {
  if (!currentChild) {
    childProgress.textContent = 'Vul eerst een naam in.';
    return;
  }

  let data;
  try {
    const res = await fetch(`/api/children/${encodeURIComponent(currentChild)}`, {
      headers: {
        'x-child-token': childToken
      }
    });

    if (res.status === 401) {
      childProgress.textContent = 'Token ontbreekt of is ongeldig. Herstart of reset de browser.';
      return;
    }

    data = await res.json();
  } catch (error) {
    console.error('Kon kindprogressie niet laden', error);
    childProgress.textContent = 'Server niet bereikbaar. Controleer de verbinding.';
    return;
  }

  if (!data.length) {
    childProgress.textContent = 'Nog geen rondes opgeslagen.';
    return;
  }

  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.padding = 0;

  data.forEach((row) => {
    const item = document.createElement('li');
    item.style.marginBottom = '8px';
    item.textContent = `${row.activity} • Score ${row.score} • ${new Date(row.createdAt).toLocaleString('nl-NL')}`;
    list.appendChild(item);
  });

  childProgress.innerHTML = '';
  childProgress.appendChild(list);
}

refreshChildBtn.addEventListener('click', loadChildProgress);

// Fullscreen helpers
document.querySelectorAll('[data-fullscreen-target]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.fullscreenTarget;
    const el = document.getElementById(targetId);
    if (el?.requestFullscreen) {
      el.requestFullscreen();
    }
  });
});

loadIdentity();

childNameInput.addEventListener('input', (e) => {
  setChildName(e.target.value.trim());
});
