/* bourses.js — Rendu et CRUD bourses */

function renderBourses() {
  const q = (document.getElementById('bourse-search')?.value || '').toLowerCase();
  const f = document.getElementById('bourse-filter')?.value || '';

  let data = STORE.get('bourses')
    .filter(b => !q || b.nom.toLowerCase().includes(q) || b.pays.toLowerCase().includes(q))
    .filter(b => !f || b.statut === f)
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));

  const grid = document.getElementById('bourses-grid');
  if (!grid) return;

  if (!data.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">${icons.star}</div>
      <h3>Aucune bourse trouvée</h3>
      <p>Modifiez votre recherche ou ajoutez une nouvelle bourse.</p>
    </div>`;
    return;
  }

  grid.innerHTML = data.map(b => bourseCardHTML(b)).join('');
}

function bourseCardHTML(b) {
  const days = daysUntil(b.deadline);

  /* Deadline bar */
  let pct = 0, barCls = 'safe';
  if (b.debut && b.deadline) {
    const total = daysUntil(b.debut) < 0
      ? Math.abs(new Date(b.deadline) - new Date(b.debut)) / 86400000
      : 0;
    pct = total > 0 ? Math.min(100, Math.round(((Math.abs(daysUntil(b.debut))) / total) * 100)) : 50;
  }
  if (days <= 7)  barCls = 'urgent';
  else if (days <= 30) barCls = 'soon';

  const daysLabel = days < 0 ? 'Deadline passée'
    : days === 0 ? 'Aujourd\'hui !'
    : `${days} jours restants`;

  const statusLabels = {
    ouverte: 'Ouverte',
    fermee:  'Fermée',
    bientot: 'Bientôt fermée',
    postule: 'Postulée',
  };

  return `<div class="bourse-card statut-${b.statut}">
    <div class="bourse-header">
      <div class="bourse-header-left">
        <span class="bourse-flag">${countryFlag(b.pays)}</span>
        <div>
          <div class="bourse-name">${b.nom}</div>
          <div class="bourse-country">${icons.search.replace('class="', 'style="width:11px;height:11px;color:var(--muted-light)" class="')} ${b.pays}</div>
        </div>
      </div>
      <span class="status-badge status-${b.statut}">
        <span class="status-dot"></span>${statusLabels[b.statut] || b.statut}
      </span>
    </div>

    ${b.desc ? `<p class="bourse-desc">${b.desc}</p>` : ''}

    <div class="deadline-bar-wrap">
      <div class="deadline-bar-info">
        <span>Progression deadline</span>
        <span class="days-left ${barCls}">${daysLabel}</span>
      </div>
      <div class="deadline-bar">
        <div class="deadline-fill ${barCls}" style="width:${pct}%"></div>
      </div>
    </div>

    <div class="bourse-footer">
      <div class="bourse-dates">
        ${b.debut ? `<div class="bourse-date">${icons.calendar}<span>Ouverture : <strong>${formatDate(b.debut)}</strong></span></div>` : ''}
        <div class="bourse-date">${icons.clock}<span>Deadline : <strong>${formatDate(b.deadline)}</strong></span></div>
      </div>
    </div>

    <div class="bourse-actions">
      ${b.lien ? `<a href="${b.lien}" target="_blank" class="btn btn-ghost btn-sm">${icons.link} Visiter</a>` : ''}
      ${b.statut !== 'postule' && b.statut !== 'fermee'
        ? `<button class="btn btn-success btn-sm" onclick="marquerPostule(${b.id})">${icons.plane} Postulée</button>`
        : ''}
      <button class="btn btn-ghost btn-sm" onclick="editBourse(${b.id})">${icons.edit} Modifier</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="askDelete('bourse', ${b.id})" title="Supprimer">${icons.trash}</button>
    </div>
  </div>`;
}

/* ── CRUD ── */
function openAddBourse() {
  document.getElementById('modal-bourse-title').textContent = 'Ajouter une bourse';
  document.getElementById('bourse-edit-id').value = '';
  ['b-nom','b-pays','b-lien','b-desc','b-debut','b-deadline'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('b-statut').value = 'ouverte';
  openModal('modal-bourse');
}

function editBourse(id) {
  const b = STORE.getOne('bourses', id); if (!b) return;
  document.getElementById('modal-bourse-title').textContent = 'Modifier la bourse';
  document.getElementById('bourse-edit-id').value = id;
  document.getElementById('b-nom').value       = b.nom;
  document.getElementById('b-pays').value      = b.pays;
  document.getElementById('b-lien').value      = b.lien || '';
  document.getElementById('b-desc').value      = b.desc || '';
  document.getElementById('b-debut').value     = b.debut || '';
  document.getElementById('b-deadline').value  = b.deadline;
  document.getElementById('b-statut').value    = b.statut;
  openModal('modal-bourse');
}

function saveBourse() {
  const nom      = document.getElementById('b-nom').value.trim();
  const pays     = document.getElementById('b-pays').value.trim();
  const deadline = document.getElementById('b-deadline').value;
  if (!nom || !pays || !deadline) {
    toast('Remplissez les champs obligatoires (*)', 'error'); return;
  }
  const bourses = STORE.get('bourses');
  const editId  = document.getElementById('bourse-edit-id').value;
  const obj = {
    nom, pays,
    lien:     document.getElementById('b-lien').value.trim(),
    desc:     document.getElementById('b-desc').value.trim(),
    debut:    document.getElementById('b-debut').value,
    deadline,
    statut:   document.getElementById('b-statut').value,
  };
  if (editId) {
    const i = bourses.findIndex(b => b.id == editId);
    bourses[i] = { ...bourses[i], ...obj };
    toast('Bourse mise à jour ✓', 'success');
  } else {
    obj.id = Date.now();
    bourses.push(obj);
    toast('Bourse ajoutée ✓', 'success');
  }
  STORE.set('bourses', bourses);
  closeModal('modal-bourse');
  renderBourses();
  renderDashboard();
}

function marquerPostule(id) {
  const bourses = STORE.get('bourses');
  const i = bourses.findIndex(b => b.id == id);
  if (i === -1) return;
  bourses[i].statut = 'postule';
  STORE.set('bourses', bourses);
  renderBourses();
  renderDashboard();
  toast('Bourse marquée comme "Postulée" ✈️', 'info');
}

