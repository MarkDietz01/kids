const activityFilter = document.getElementById('activityFilter');
const refreshAdmin = document.getElementById('refreshAdmin');
const progressBody = document.getElementById('progressBody');
const summary = document.getElementById('summary');
const adminKeyInput = document.getElementById('adminKey');

async function loadAdminTable() {
  let data;
  try {
    const res = await fetch('/api/admin/progress', {
      headers: {
        'x-admin-key': adminKeyInput.value || ''
      }
    });

    if (res.status === 401) {
      summary.textContent = 'Admin sleutel ongeldig of niet ingevuld.';
      progressBody.innerHTML = '';
      return;
    }

    data = await res.json();
  } catch (error) {
    console.error('Kon admin progressie niet laden', error);
    summary.textContent = 'Server niet bereikbaar. Controleer de verbinding.';
    progressBody.innerHTML = '';
    return;
  }
  const filtered = activityFilter.value ? data.filter((row) => row.activity === activityFilter.value) : data;

  progressBody.innerHTML = '';

  if (!filtered.length) {
    summary.textContent = 'Nog geen opgeslagen rondes.';
    return;
  }

  const avg = (
    filtered.reduce((acc, row) => acc + Number(row.score || 0), 0) / filtered.length
  ).toFixed(2);
  summary.textContent = `${filtered.length} rondes • Gemiddelde score ${avg}`;

  filtered.forEach((row) => {
    const tr = document.createElement('tr');
    const details = row.details ? JSON.parse(row.details) : {};
    tr.innerHTML = `
      <td>${row.childName}</td>
      <td>${row.activity}</td>
      <td>${row.score}</td>
      <td>${Object.keys(details).length ? JSON.stringify(details) : '–'}</td>
      <td>${new Date(row.createdAt).toLocaleString('nl-NL')}</td>
    `;
    progressBody.appendChild(tr);
  });
}

refreshAdmin.addEventListener('click', loadAdminTable);
activityFilter.addEventListener('change', loadAdminTable);

const savedAdminKey = localStorage.getItem('kd_admin_key');
if (savedAdminKey) {
  adminKeyInput.value = savedAdminKey;
}

adminKeyInput.addEventListener('input', (e) => {
  localStorage.setItem('kd_admin_key', e.target.value);
});

loadAdminTable();
