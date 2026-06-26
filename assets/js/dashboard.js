/* dashboard.js — Rendu du tableau de bord */

function renderDashboard() {
  const bourses = STORE.get('bourses');
  const docs    = STORE.get('documents');

  /* KPIs */
  document.getElementById('kpi-total').textContent  = bourses.length;
  document.getElementById('kpi-open').textContent   = bourses.filter(b => b.statut === 'ouverte').length;
  document.getElementById('kpi-postule').textContent = bourses.filter(b => b.statut === 'postule').length;
  document.getElementById('kpi-docs-ok').textContent = docs.filter(d => d.statut === 'Disponible').length;

  /* Progress docs */
  const totalDocs = docs.length;
  const dispoDocs = docs.filter(d => d.statut === 'Disponible').length;
  const pct = totalDocs ? Math.round((dispoDocs / totalDocs) * 100) : 0;
  const fill = document.getElementById('doc-progress-fill');
  const pctEl = document.getElementById('doc-progress-pct');
  if (fill) { fill.style.width = pct + '%'; }
  if (pctEl) { pctEl.textContent = pct + '%'; }

  /* Alert banner */
  const urgentBourses = bourses.filter(b => b.statut !== 'fermee' && daysUntil(b.deadline) >= 0 && daysUntil(b.deadline) <= 7);
  const alertEl = document.getElementById('alert-banner');
  if (alertEl) {
    if (urgentBourses.length > 0) {
      alertEl.style.display = 'flex';
      alertEl.querySelector('.alert-banner-text').innerHTML =
        `<strong>${urgentBourses.length} bourse(s) expirent dans moins de 7 jours !</strong> Complétez vos dossiers dès maintenant.`;
    } else {
      alertEl.style.display = 'none';
    }
  }

  /* Deadlines */
  const upcoming = bourses
    .filter(b => b.statut !== 'fermee')
    .map(b => ({ ...b, days: daysUntil(b.deadline) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  const dlList = document.getElementById('deadline-list');
  if (dlList) {
    if (!upcoming.length) {
      dlList.innerHTML = emptyStateSmall('Aucune deadline à venir');
    } else {
      dlList.innerHTML = upcoming.map(b => {
        const d = b.days;
        let cls = d <= 7 ? 'badge-danger' : d <= 30 ? 'badge-warning' : 'badge-success';
        let label = d < 0 ? 'Passée' : d === 0 ? 'Aujourd\'hui !' : `${d} j`;
        return `<div class="deadline-item">
          <div class="deadline-left">
            <span class="deadline-flag">${countryFlag(b.pays)}</span>
            <div class="deadline-info">
              <div class="deadline-name">${b.nom}</div>
              <div class="deadline-country">${b.pays}</div>
            </div>
          </div>
          <span class="badge ${cls}"><span class="badge-dot"></span>${label}</span>
        </div>`;
      }).join('');
    }
  }

  /* Doc status */
  const dslList = document.getElementById('doc-status-list');
  if (dslList) {
    if (!docs.length) {
      dslList.innerHTML = emptyStateSmall('Aucun document enregistré');
    } else {
      dslList.innerHTML = docs.slice(0, 7).map(d => {
        const cls = d.statut === 'Disponible' ? 'badge-success' : 'badge-warning';
        const hasPdf = d.pdfData ? `<span style="font-size:10px;color:#EF4444;margin-left:4px">📎 PDF</span>` : '';
        return `<div class="deadline-item">
          <div class="deadline-name">${d.nom}${hasPdf}</div>
          <span class="badge ${cls}"><span class="badge-dot"></span>${d.statut}</span>
        </div>`;
      }).join('');
    }
  }
}

function emptyStateSmall(msg) {
  return `<div style="padding:28px;text-align:center;color:var(--muted);font-size:13px;">${msg}</div>`;
}

