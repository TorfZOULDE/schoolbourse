/* documents.js — Rendu et CRUD documents + upload PDF */

let tempPdfData = null;
let tempPdfName = null;

function renderDocs() {
  const q = (document.getElementById('doc-search')?.value || '').toLowerCase();
  const f = document.getElementById('doc-filter')?.value || '';

  let data = STORE.get('documents')
    .filter(d => !q || d.nom.toLowerCase().includes(d.nom ? q : ''))
    .filter(d => !q || d.nom.toLowerCase().includes(q))
    .filter(d => !f || d.statut === f);

  const grid = document.getElementById('docs-grid');
  if (!grid) return;

  if (!data.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">${icons.file}</div>
      <h3>Aucun document trouvé</h3>
      <p>Ajoutez vos pièces de candidature ici.</p>
    </div>`;
    return;
  }

  grid.innerHTML = data.map(d => docCardHTML(d)).join('');
}

function docCardHTML(d) {
  const hasPdf = !!d.pdfData;
  const isDispo = d.statut === 'Disponible';

  const pdfBlock = hasPdf
    ? `<div class="doc-pdf-info">
        ${icons.pdf}
        <span class="doc-pdf-name">${d.pdfName}</span>
      </div>`
    : `<div class="doc-no-pdf">
        ${icons.upload}
        <span>Aucun fichier PDF joint</span>
      </div>`;

  const pdfActions = hasPdf
    ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="previewPdf(${d.id})" title="Aperçu PDF">${icons.eye}</button>
       <button class="btn btn-ghost btn-sm btn-icon" onclick="downloadPdf(${d.id})" title="Télécharger">${icons.download}</button>`
    : '';

  return `<div class="doc-card">
    <div class="doc-top">
      <div class="doc-icon-wrap ${hasPdf ? 'has-pdf' : ''}">
        ${hasPdf ? icons.pdf : icons.file}
      </div>
      <div class="doc-info">
        <div class="doc-name">${d.nom}</div>
        ${d.desc ? `<div class="doc-desc">${d.desc}</div>` : ''}
      </div>
    </div>

    ${pdfBlock}

    <div class="doc-footer">
      <span class="doc-statut-badge ${isDispo ? 'dispo' : 'attente'}">
        <span class="doc-statut-dot"></span>${d.statut}
      </span>
      <div class="doc-actions">
        ${pdfActions}
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editDoc(${d.id})" title="Modifier">${icons.edit}</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="askDelete('doc', ${d.id})" title="Supprimer">${icons.trash}</button>
      </div>
    </div>
  </div>`;
}

/* ── CRUD ── */
function openAddDoc() {
  document.getElementById('modal-doc-title').textContent = 'Ajouter un document';
  document.getElementById('doc-edit-id').value = '';
  document.getElementById('d-nom').value  = '';
  document.getElementById('d-desc').value = '';
  document.getElementById('d-statut').value = 'Disponible';
  tempPdfData = null;
  tempPdfName = null;
  resetFileZone();
  openModal('modal-doc');
}

function editDoc(id) {
  const d = STORE.getOne('documents', id); if (!d) return;
  document.getElementById('modal-doc-title').textContent = 'Modifier le document';
  document.getElementById('doc-edit-id').value = id;
  document.getElementById('d-nom').value   = d.nom;
  document.getElementById('d-desc').value  = d.desc || '';
  document.getElementById('d-statut').value = d.statut;
  tempPdfData = d.pdfData || null;
  tempPdfName = d.pdfName || null;
  if (tempPdfName) showFileZoneSuccess(tempPdfName);
  else resetFileZone();
  openModal('modal-doc');
}

function saveDoc() {
  const nom = document.getElementById('d-nom').value.trim();
  if (!nom) { toast('Le nom du document est requis', 'error'); return; }

  const docs   = STORE.get('documents');
  const editId = document.getElementById('doc-edit-id').value;
  const obj = {
    nom,
    desc:    document.getElementById('d-desc').value.trim(),
    statut:  document.getElementById('d-statut').value,
    pdfData: tempPdfData,
    pdfName: tempPdfName,
  };

  if (editId) {
    const i = docs.findIndex(d => d.id == editId);
    docs[i] = { ...docs[i], ...obj };
    toast('Document mis à jour ✓', 'success');
  } else {
    obj.id = Date.now();
    docs.push(obj);
    toast('Document ajouté ✓', 'success');
  }

  STORE.set('documents', docs);
  closeModal('modal-doc');
  renderDocs();
  renderDashboard();
}

/* ── PDF UPLOAD ── */
function handleFileInput(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') {
    toast('Seuls les fichiers PDF sont acceptés', 'error'); return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast('Fichier trop lourd (max 5 Mo)', 'error'); return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    tempPdfData = e.target.result;
    tempPdfName = file.name;
    showFileZoneSuccess(file.name);
    toast('Fichier PDF chargé', 'info');
  };
  reader.readAsDataURL(file);
}

function resetFileZone() {
  const zone = document.getElementById('file-upload-zone');
  if (!zone) return;
  zone.classList.remove('has-file');
  zone.innerHTML = `
    <input type="file" accept=".pdf" onchange="handleFileInput(this)">
    <div class="file-upload-icon">${icons.upload}</div>
    <div class="file-upload-text">
      <strong>Glissez un PDF ici</strong>
      ou cliquez pour sélectionner
    </div>`;
}

function showFileZoneSuccess(name) {
  const zone = document.getElementById('file-upload-zone');
  if (!zone) return;
  zone.classList.add('has-file');
  zone.innerHTML = `
    <input type="file" accept=".pdf" onchange="handleFileInput(this)">
    <div class="file-upload-icon" style="background:var(--success-dim)">${icons.check.replace('currentColor','var(--success)')}</div>
    <div class="file-upload-name">${icons.pdf} ${name}</div>
    <div class="file-upload-text" style="margin-top:4px">Cliquer pour remplacer</div>`;
}

/* ── PDF VIEWER ── */
function previewPdf(id) {
  const d = STORE.getOne('documents', id); if (!d || !d.pdfData) return;
  document.getElementById('pdf-modal-title').textContent = d.nom;
  const frame = document.getElementById('pdf-viewer-frame');
  frame.src = d.pdfData;
  document.getElementById('pdf-download-btn').onclick = () => downloadPdf(id);
  openModal('modal-pdf');
}

function downloadPdf(id) {
  const d = STORE.getOne('documents', id); if (!d || !d.pdfData) return;
  const a = document.createElement('a');
  a.href = d.pdfData;
  a.download = d.pdfName || `${d.nom}.pdf`;
  a.click();
}

