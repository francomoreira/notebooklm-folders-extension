// NotebookLM Folders - Content Script
(function() {
  'use strict';

  const STORAGE_KEY = 'notebooklm_folders_';
  const SOURCE_ITEM_SELECTOR = '.single-source-container';

  let notebookId = null;
  let folderStructure = { folders: {}, unassigned: [] };
  let sourceElements = new Map();
  let observer = null;
  let observerDebounce = null;
  let dragDropInitialized = false;
  let injecting = false;

  function getNotebookId() {
    const match = window.location.pathname.match(/\/notebook\/([^/]+)/);
    return match ? match[1] : null;
  }

  function loadStructure() {
    notebookId = getNotebookId();
    if (!notebookId) return;
    const saved = localStorage.getItem(STORAGE_KEY + notebookId);
    if (saved) {
      try { folderStructure = JSON.parse(saved); }
      catch { folderStructure = { folders: {}, unassigned: [] }; }
    } else {
      folderStructure = {
        folders: { "Unidad 1": [], "Unidad 2": [], "Unidad 3": [] },
        unassigned: []
      };
    }
  }

  function saveStructure() {
    localStorage.setItem(STORAGE_KEY + notebookId, JSON.stringify(folderStructure));
  }

  // ID estable: aria-label del botón interno (= nombre del archivo)
  function getSourceId(element) {
    const btn = element.querySelector('button[aria-label]');
    if (btn) return btn.getAttribute('aria-label');
    const txt = element.textContent.trim();
    return txt ? txt.slice(0, 200) : null;
  }

  // Padre real de los .single-source-container (ignorando los clones que viven dentro de la UI propia)
  function findSourcesList() {
    const items = document.querySelectorAll(SOURCE_ITEM_SELECTOR);
    for (const item of items) {
      if (!item.closest('#nbm-folders-container')) {
        return item.parentElement;
      }
    }
    return null;
  }

  function getElementPath(el) {
    const parts = [];
    let cur = el;
    while (cur && cur !== document.body && parts.length < 8) {
      parts.unshift(cur.tagName + (cur.id ? '#' + cur.id : '') + (cur.className ? '.' + String(cur.className).split(' ').slice(0, 2).join('.') : ''));
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  function createFolderUI() {
    if (injecting) return false;
    const sourcesContainer = findSourcesList();
    if (!sourcesContainer) return false;
    injecting = true;
    if (observer) observer.disconnect();
    try {
      return doInject(sourcesContainer);
    } finally {
      injecting = false;
      if (observer) observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  function doInject(sourcesContainer) {

    const existing = document.getElementById('nbm-folders-container');
    if (existing && existing.dataset.boundTo === getElementPath(sourcesContainer)) {
      if (sourcesContainer.style.display !== 'none') {
        sourcesContainer.style.display = 'none';
      }
      return true;
    }
    if (existing) existing.remove();

    console.log('[NBM] Inyectando UI sobre contenedor:', sourcesContainer);

    sourceElements.clear();
    const sourceItems = sourcesContainer.querySelectorAll(SOURCE_ITEM_SELECTOR);
    sourceItems.forEach(item => {
      const sourceId = getSourceId(item);
      if (!sourceId) return;
      const clone = item.cloneNode(true);
      clone.removeAttribute('draggable');
      clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
      sourceElements.set(sourceId, clone);
    });

    // Sincronizar estructura con fuentes existentes
    const validIds = new Set(sourceElements.keys());
    folderStructure.unassigned = folderStructure.unassigned.filter(id => validIds.has(id));
    for (const folderName in folderStructure.folders) {
      folderStructure.folders[folderName] = folderStructure.folders[folderName].filter(id => validIds.has(id));
    }
    for (const id of validIds) {
      let assigned = false;
      for (const sources of Object.values(folderStructure.folders)) {
        if (sources.includes(id)) { assigned = true; break; }
      }
      if (!assigned && !folderStructure.unassigned.includes(id)) {
        folderStructure.unassigned.push(id);
      }
    }
    saveStructure();

    const folderContainer = document.createElement('div');
    folderContainer.id = 'nbm-folders-container';
    folderContainer.className = 'nbm-folders-root';
    folderContainer.dataset.boundTo = getElementPath(sourcesContainer);

    const header = document.createElement('div');
    header.className = 'nbm-header';
    header.innerHTML = `
      <div class="nbm-controls">
        <button id="nbm-toggle-view" class="nbm-btn">📁 Vista Carpetas</button>
        <button id="nbm-add-folder" class="nbm-btn">+ Nueva Carpeta</button>
      </div>
    `;
    folderContainer.appendChild(header);

    const foldersWrapper = document.createElement('div');
    foldersWrapper.id = 'nbm-folders-wrapper';
    foldersWrapper.className = 'nbm-folders-wrapper';
    folderContainer.appendChild(foldersWrapper);

    renderFolders(foldersWrapper);

    sourcesContainer.parentNode.insertBefore(folderContainer, sourcesContainer);
    sourcesContainer.style.display = 'none';

    document.getElementById('nbm-toggle-view').addEventListener('click', toggleView);
    document.getElementById('nbm-add-folder').addEventListener('click', addNewFolder);

    setupDragAndDrop();
    console.log('[NBM] UI lista — fuentes:', sourceElements.size);
    return true;
  }

  function renderFolders(container) {
    container.innerHTML = '';
    for (const [folderName, sources] of Object.entries(folderStructure.folders)) {
      container.appendChild(createFolder(folderName, sources));
    }
    if (folderStructure.unassigned.length > 0) {
      container.appendChild(createFolder('📥 Sin asignar', folderStructure.unassigned, true));
    }
  }

  function createFolder(name, sources, isUnassigned = false) {
    const folder = document.createElement('div');
    folder.className = 'nbm-folder';
    folder.dataset.folderName = name;

    const header = document.createElement('div');
    header.className = 'nbm-folder-header';
    header.innerHTML = `
      <span class="nbm-folder-toggle">▶</span>
      <input type="text" class="nbm-folder-name" value="${escapeAttr(name)}" ${isUnassigned ? 'readonly' : ''}>
      <span class="nbm-folder-count">${sources.length}</span>
      ${!isUnassigned ? '<button class="nbm-delete-folder">🗑️</button>' : ''}
    `;

    const content = document.createElement('div');
    content.className = 'nbm-folder-content';
    content.style.display = 'none';

    sources.forEach(sourceId => {
      const sourceEl = sourceElements.get(sourceId);
      if (!sourceEl) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'nbm-source-item';
      wrapper.setAttribute('draggable', 'true');
      wrapper.dataset.sourceId = sourceId;
      wrapper.appendChild(sourceEl.cloneNode(true));
      content.appendChild(wrapper);
    });

    folder.appendChild(header);
    folder.appendChild(content);

    header.querySelector('.nbm-folder-toggle').addEventListener('click', () => {
      const isOpen = content.style.display === 'block';
      content.style.display = isOpen ? 'none' : 'block';
      header.querySelector('.nbm-folder-toggle').textContent = isOpen ? '▶' : '▼';
    });

    if (!isUnassigned) {
      const nameInput = header.querySelector('.nbm-folder-name');
      nameInput.addEventListener('blur', () => renameFolder(name, nameInput.value));
      nameInput.addEventListener('keypress', e => { if (e.key === 'Enter') nameInput.blur(); });
      header.querySelector('.nbm-delete-folder').addEventListener('click', () => deleteFolder(name));
    }

    return folder;
  }

  function escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function setupDragAndDrop() {
    if (dragDropInitialized) return;
    dragDropInitialized = true;

    document.addEventListener('dragstart', e => {
      const sourceItem = e.target.closest('.nbm-source-item');
      if (sourceItem) {
        console.log('[NBM] DRAGSTART:', sourceItem.dataset.sourceId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', sourceItem.dataset.sourceId);
        sourceItem.style.opacity = '0.5';
      }
    });

    document.addEventListener('dragend', e => {
      const sourceItem = e.target.closest('.nbm-source-item');
      if (sourceItem) sourceItem.style.opacity = '1';
      document.querySelectorAll('.nbm-folder').forEach(f => f.classList.remove('drag-over-folder'));
      document.querySelectorAll('.nbm-folder-content').forEach(c => c.classList.remove('drag-over'));
    });

    document.addEventListener('dragover', e => {
      const folder = e.target.closest('.nbm-folder');
      if (folder) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        folder.classList.add('drag-over-folder');
        const content = folder.querySelector('.nbm-folder-content');
        if (content) content.classList.add('drag-over');
      }
    });

    document.addEventListener('dragleave', e => {
      const folder = e.target.closest('.nbm-folder');
      if (folder && !folder.contains(e.relatedTarget)) {
        folder.classList.remove('drag-over-folder');
        const content = folder.querySelector('.nbm-folder-content');
        if (content) content.classList.remove('drag-over');
      }
    });

    document.addEventListener('drop', e => {
      const folder = e.target.closest('.nbm-folder');
      if (!folder) return;
      e.preventDefault();
      e.stopPropagation();
      const sourceId = e.dataTransfer.getData('text/plain');
      const targetFolder = folder.dataset.folderName;
      console.log('[NBM] DROP', sourceId, '→', targetFolder);
      folder.classList.remove('drag-over-folder');
      const content = folder.querySelector('.nbm-folder-content');
      if (content) content.classList.remove('drag-over');
      if (sourceId) moveSourceToFolder(sourceId, targetFolder);
      if (content && content.style.display === 'none') {
        content.style.display = 'block';
        folder.querySelector('.nbm-folder-toggle').textContent = '▼';
      }
    });
  }

  function moveSourceToFolder(sourceId, targetFolderName) {
    for (const sources of Object.values(folderStructure.folders)) {
      const i = sources.indexOf(sourceId);
      if (i > -1) sources.splice(i, 1);
    }
    const ui = folderStructure.unassigned.indexOf(sourceId);
    if (ui > -1) folderStructure.unassigned.splice(ui, 1);

    if (targetFolderName === '📥 Sin asignar') {
      folderStructure.unassigned.push(sourceId);
    } else if (folderStructure.folders[targetFolderName]) {
      folderStructure.folders[targetFolderName].push(sourceId);
    }
    saveStructure();
    refreshUI();
  }

  function addNewFolder() {
    const name = prompt('Nombre de la nueva carpeta:');
    if (name && !folderStructure.folders[name]) {
      folderStructure.folders[name] = [];
      saveStructure();
      refreshUI();
    }
  }

  function renameFolder(oldName, newName) {
    if (newName && oldName !== newName && !folderStructure.folders[newName]) {
      folderStructure.folders[newName] = folderStructure.folders[oldName];
      delete folderStructure.folders[oldName];
      saveStructure();
      refreshUI();
    }
  }

  function deleteFolder(name) {
    if (confirm(`¿Eliminar carpeta "${name}"? Las fuentes se moverán a "Sin asignar"`)) {
      folderStructure.unassigned.push(...folderStructure.folders[name]);
      delete folderStructure.folders[name];
      saveStructure();
      refreshUI();
    }
  }

  function toggleView() {
    const wrapper = document.getElementById('nbm-folders-wrapper');
    const original = findSourcesList();
    if (wrapper.style.display === 'none') {
      wrapper.style.display = '';
      if (original) original.style.display = 'none';
      document.getElementById('nbm-toggle-view').textContent = '📁 Vista Carpetas';
    } else {
      wrapper.style.display = 'none';
      if (original) original.style.display = '';
      document.getElementById('nbm-toggle-view').textContent = '📋 Vista Lista';
    }
  }

  function refreshUI() {
    const wrapper = document.getElementById('nbm-folders-wrapper');
    if (wrapper) renderFolders(wrapper);
  }

  // MutationObserver: re-inyectar cuando Angular remonta el panel de fuentes
  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      if (observerDebounce) return;
      observerDebounce = setTimeout(() => {
        observerDebounce = null;
        const sources = findSourcesList();
        if (!sources) return;
        const ui = document.getElementById('nbm-folders-container');
        if (!ui) {
          createFolderUI();
        } else if (ui.dataset.boundTo !== getElementPath(sources)) {
          createFolderUI();
        } else if (sources.style.display !== 'none') {
          sources.style.display = 'none';
        }
      }, 250);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    loadStructure();
    if (!notebookId) return;
    const tryInject = () => {
      if (createFolderUI()) return;
      setTimeout(tryInject, 1000);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(tryInject, 500));
    } else {
      setTimeout(tryInject, 500);
    }
    startObserver();
  }

  init();
})();
