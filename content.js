// NotebookLM Folders - Content Script
(function() {
  'use strict';

  const STORAGE_KEY = 'notebooklm_folders_';
  let notebookId = null;
  let folderStructure = { folders: {}, unassigned: [] };
  let sourceElements = new Map();

  // Obtener ID del notebook de la URL
  function getNotebookId() {
    const match = window.location.pathname.match(/\/notebook\/([^/]+)/);
    return match ? match[1] : null;
  }

  // Cargar estructura desde localStorage
  function loadStructure() {
    notebookId = getNotebookId();
    if (!notebookId) return;
    
    const saved = localStorage.getItem(STORAGE_KEY + notebookId);
    if (saved) {
      folderStructure = JSON.parse(saved);
    } else {
      folderStructure = { 
        folders: { 
          "Unidad 1": [],
          "Unidad 2": [],
          "Unidad 3": []
        }, 
        unassigned: [] 
      };
    }
  }

  // Guardar estructura en localStorage
  function saveStructure() {
    localStorage.setItem(STORAGE_KEY + notebookId, JSON.stringify(folderStructure));
  }

  // Obtener ID único de una fuente
  function getSourceId(element) {
    // Intentar obtener un identificador único del elemento
    const textContent = element.textContent.trim();
    return textContent || Math.random().toString(36);
  }

  // Crear UI de carpetas
  function createFolderUI() {
    const sourcesContainer = document.querySelector('[role="list"]') || 
                            document.querySelector('.sources-list') ||
                            findSourcesList();
    
    if (!sourcesContainer) {
      console.log('No se encontró contenedor de fuentes, reintentando...');
      setTimeout(createFolderUI, 1000);
      return;
    }

    // Ocultar lista original
    sourcesContainer.style.display = 'none';

    // Crear contenedor de carpetas
    const folderContainer = document.createElement('div');
    folderContainer.id = 'nbm-folders-container';
    folderContainer.className = 'nbm-folders-root';

    // Header con controles
    const header = document.createElement('div');
    header.className = 'nbm-header';
    header.innerHTML = `
      <div class="nbm-controls">
        <button id="nbm-toggle-view" class="nbm-btn">📁 Vista Carpetas</button>
        <button id="nbm-add-folder" class="nbm-btn">+ Nueva Carpeta</button>
      </div>
    `;
    folderContainer.appendChild(header);

    // Contenedor de carpetas
    const foldersWrapper = document.createElement('div');
    foldersWrapper.id = 'nbm-folders-wrapper';
    foldersWrapper.className = 'nbm-folders-wrapper';

    // Capturar elementos de fuentes originales
    const sourceItems = Array.from(sourcesContainer.querySelectorAll('[role="listitem"]') ||
                                    sourcesContainer.children);
    
    sourceItems.forEach(item => {
      const sourceId = getSourceId(item);
      sourceElements.set(sourceId, item.cloneNode(true));
      
      // Si no está asignado a ninguna carpeta, agregar a unassigned
      let assigned = false;
      for (const [folderName, sources] of Object.entries(folderStructure.folders)) {
        if (sources.includes(sourceId)) {
          assigned = true;
          break;
        }
      }
      if (!assigned && !folderStructure.unassigned.includes(sourceId)) {
        folderStructure.unassigned.push(sourceId);
      }
    });

    // Renderizar carpetas
    renderFolders(foldersWrapper);

    folderContainer.appendChild(foldersWrapper);
    sourcesContainer.parentNode.insertBefore(folderContainer, sourcesContainer);

    // Event listeners
    document.getElementById('nbm-toggle-view').addEventListener('click', toggleView);
    document.getElementById('nbm-add-folder').addEventListener('click', addNewFolder);

    setupDragAndDrop();
  }

  // Renderizar todas las carpetas
  function renderFolders(container) {
    container.innerHTML = '';

    // Renderizar carpetas
    for (const [folderName, sources] of Object.entries(folderStructure.folders)) {
      const folderEl = createFolder(folderName, sources);
      container.appendChild(folderEl);
    }

    // Carpeta de "Sin asignar"
    if (folderStructure.unassigned.length > 0) {
      const unassignedFolder = createFolder('📥 Sin asignar', folderStructure.unassigned, true);
      container.appendChild(unassignedFolder);
    }
  }

  // Crear elemento de carpeta
  function createFolder(name, sources, isUnassigned = false) {
    const folder = document.createElement('div');
    folder.className = 'nbm-folder';
    folder.dataset.folderName = name;

    const header = document.createElement('div');
    header.className = 'nbm-folder-header';
    header.innerHTML = `
      <span class="nbm-folder-toggle">▶</span>
      <input type="text" class="nbm-folder-name" value="${name}" ${isUnassigned ? 'readonly' : ''}>
      <span class="nbm-folder-count">${sources.length}</span>
      ${!isUnassigned ? '<button class="nbm-delete-folder">🗑️</button>' : ''}
    `;

    const content = document.createElement('div');
    content.className = 'nbm-folder-content';
    content.style.display = 'none';

    // Agregar fuentes
    sources.forEach(sourceId => {
      const sourceEl = sourceElements.get(sourceId);
      if (sourceEl) {
        const wrapper = document.createElement('div');
        wrapper.className = 'nbm-source-item';
        wrapper.setAttribute('draggable', 'true');
        wrapper.dataset.sourceId = sourceId;
        wrapper.style.cursor = 'grab';
        wrapper.appendChild(sourceEl);
        content.appendChild(wrapper);
        console.log('[NBM] Source item created:', sourceId);
      } else {
        console.warn('[NBM] Source element not found:', sourceId);
      }
    });

    folder.appendChild(header);
    folder.appendChild(content);

    // Toggle carpeta
    header.querySelector('.nbm-folder-toggle').addEventListener('click', () => {
      const isOpen = content.style.display === 'block';
      content.style.display = isOpen ? 'none' : 'block';
      header.querySelector('.nbm-folder-toggle').textContent = isOpen ? '▶' : '▼';
    });

    // Renombrar carpeta
    if (!isUnassigned) {
      const nameInput = header.querySelector('.nbm-folder-name');
      nameInput.addEventListener('blur', () => renameFolder(name, nameInput.value));
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          nameInput.blur();
        }
      });

      // Eliminar carpeta
      header.querySelector('.nbm-delete-folder').addEventListener('click', () => deleteFolder(name));
    }

    return folder;
  }

  let dragDropInitialized = false;

  // Configurar drag and drop
  function setupDragAndDrop() {
    if (dragDropInitialized) return;
    dragDropInitialized = true;
    console.log('[NBM] Setting up drag and drop...');

    document.addEventListener('dragstart', (e) => {
      const sourceItem = e.target.closest('.nbm-source-item');
      if (sourceItem) {
        console.log('[NBM] DRAGSTART:', sourceItem.dataset.sourceId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', sourceItem.dataset.sourceId);
        sourceItem.style.opacity = '0.5';
      }
    });

    document.addEventListener('dragend', (e) => {
      const sourceItem = e.target.closest('.nbm-source-item');
      if (sourceItem) {
        console.log('[NBM] DRAGEND');
        sourceItem.style.opacity = '1';
      }
      // Limpiar todos los highlights
      document.querySelectorAll('.nbm-folder').forEach(f => f.classList.remove('drag-over-folder'));
      document.querySelectorAll('.nbm-folder-content').forEach(c => c.classList.remove('drag-over'));
    });

    document.addEventListener('dragover', (e) => {
      const folder = e.target.closest('.nbm-folder');
      if (folder) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        console.log('[NBM] DRAGOVER folder:', folder.dataset.folderName);
        // Highlight visual en la carpeta completa
        folder.classList.add('drag-over-folder');
        const content = folder.querySelector('.nbm-folder-content');
        if (content) content.classList.add('drag-over');
      }
    });

    document.addEventListener('dragleave', (e) => {
      const folder = e.target.closest('.nbm-folder');
      if (folder && !folder.contains(e.relatedTarget)) {
        console.log('[NBM] DRAGLEAVE folder:', folder.dataset.folderName);
        folder.classList.remove('drag-over-folder');
        const content = folder.querySelector('.nbm-folder-content');
        if (content) content.classList.remove('drag-over');
      }
    });

    document.addEventListener('drop', (e) => {
      const folder = e.target.closest('.nbm-folder');
      if (folder) {
        e.preventDefault();
        e.stopPropagation();
        
        const sourceId = e.dataTransfer.getData('text/plain');
        const targetFolder = folder.dataset.folderName;
        
        console.log('[NBM] DROP - Source:', sourceId, 'Target:', targetFolder);
        
        // Limpiar highlights
        folder.classList.remove('drag-over-folder');
        const content = folder.querySelector('.nbm-folder-content');
        if (content) content.classList.remove('drag-over');
        
        // Mover la fuente
        moveSourceToFolder(sourceId, targetFolder);
        
        // Auto-expandir carpeta después de drop
        if (content && content.style.display === 'none') {
          content.style.display = 'block';
          const toggle = folder.querySelector('.nbm-folder-toggle');
          if (toggle) toggle.textContent = '▼';
        }
      } else {
        console.warn('[NBM] DROP failed - No folder found');
      }
    });
    
    console.log('[NBM] Drag and drop setup complete');
  }

  // Mover fuente a carpeta
  function moveSourceToFolder(sourceId, targetFolderName) {
    console.log('[NBM] moveSourceToFolder - Source:', sourceId, 'Target:', targetFolderName);
    
    // Remover de todas las carpetas y unassigned
    for (const sources of Object.values(folderStructure.folders)) {
      const index = sources.indexOf(sourceId);
      if (index > -1) {
        console.log('[NBM] Removed from folder');
        sources.splice(index, 1);
      }
    }
    const unassignedIndex = folderStructure.unassigned.indexOf(sourceId);
    if (unassignedIndex > -1) {
      console.log('[NBM] Removed from unassigned');
      folderStructure.unassigned.splice(unassignedIndex, 1);
    }

    // Agregar a carpeta destino
    if (targetFolderName === '📥 Sin asignar') {
      console.log('[NBM] Added to unassigned');
      folderStructure.unassigned.push(sourceId);
    } else {
      console.log('[NBM] Added to folder:', targetFolderName);
      folderStructure.folders[targetFolderName].push(sourceId);
    }

    saveStructure();
    console.log('[NBM] Structure saved, refreshing UI');
    refreshUI();
  }

  // Agregar nueva carpeta
  function addNewFolder() {
    const name = prompt('Nombre de la nueva carpeta:');
    if (name && !folderStructure.folders[name]) {
      folderStructure.folders[name] = [];
      saveStructure();
      refreshUI();
    }
  }

  // Renombrar carpeta
  function renameFolder(oldName, newName) {
    if (newName && oldName !== newName && !folderStructure.folders[newName]) {
      folderStructure.folders[newName] = folderStructure.folders[oldName];
      delete folderStructure.folders[oldName];
      saveStructure();
      refreshUI();
    }
  }

  // Eliminar carpeta
  function deleteFolder(name) {
    if (confirm(`¿Eliminar carpeta "${name}"? Las fuentes se moverán a "Sin asignar"`)) {
      folderStructure.unassigned.push(...folderStructure.folders[name]);
      delete folderStructure.folders[name];
      saveStructure();
      refreshUI();
    }
  }

  // Toggle entre vista carpetas y lista
  function toggleView() {
    const foldersContainer = document.getElementById('nbm-folders-wrapper');
    const originalList = document.querySelector('[role="list"]') || findSourcesList();
    
    if (foldersContainer.style.display === 'none') {
      foldersContainer.style.display = 'block';
      if (originalList) originalList.style.display = 'none';
      document.getElementById('nbm-toggle-view').textContent = '📁 Vista Carpetas';
    } else {
      foldersContainer.style.display = 'none';
      if (originalList) originalList.style.display = 'block';
      document.getElementById('nbm-toggle-view').textContent = '📋 Vista Lista';
    }
  }

  // Refrescar UI
  function refreshUI() {
    const wrapper = document.getElementById('nbm-folders-wrapper');
    if (wrapper) {
      renderFolders(wrapper);
      setupDragAndDrop();
    }
  }

  // Buscar lista de fuentes (fallback)
  function findSourcesList() {
    const candidates = document.querySelectorAll('div[class*="source"], div[class*="list"]');
    for (const el of candidates) {
      if (el.children.length > 3) return el;
    }
    return null;
  }

  // Inicializar
  function init() {
    loadStructure();
    // Esperar a que cargue la página
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(createFolderUI, 2000));
    } else {
      setTimeout(createFolderUI, 2000);
    }
  }

  init();
})();
