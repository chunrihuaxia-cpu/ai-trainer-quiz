// Common utilities for all PDF tool pages

// Drag-and-drop upload zone
var initUploadZone = window.initUploadZone = function(zoneId, onFiles, opts = {}) {
  const zone = document.getElementById(zoneId);
  if (!zone) return;

  const { multiple = false, accept = '.pdf' } = opts;

  // Click to browse
  zone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (multiple) input.multiple = true;
    input.onchange = e => onFiles(Array.from(e.target.files));
    input.click();
  });

  // Drag events
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag');
    const files = Array.from(e.dataTransfer.files).filter(f => accept.split(',').some(ext => f.name.toLowerCase().endsWith(ext.trim())));
    if (files.length) onFiles(multiple ? files : [files[0]]);
  });
}

// Show progress
function showProgress(elId, pct) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.style.width = Math.min(100, Math.max(0, pct)) + '%';
}

// Format file size
var formatSize = window.formatSize = function(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

// Show toast message
var showToast = window.showToast = function(msg, type) {
  type = type || 'success';
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Trigger download of a Blob
var downloadBlob = window.downloadBlob = function(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// PDF.js page count
async function getPageCount(file) {
  try {
    const { PDFDocument } = await import('./pdf-lib.min.js');
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch(e) {
    return 0;
  }
}

// Load PDF-lib (dynamic import to share across tools)
let _pdfLib = null;
async function getPDFLib() {
  if (!_pdfLib) {
    const m = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
    _pdfLib = m;
  }
  return _pdfLib;
}

export { initUploadZone, formatSize, showToast, downloadBlob };
