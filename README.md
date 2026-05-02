# 📁 NotebookLM Folders Extension

[![GitHub](https://img.shields.io/badge/GitHub-francomoreira-blue)](https://github.com/francomoreira/notebooklm-folders-extension)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.6.2-green.svg)](https://github.com/francomoreira/notebooklm-folders-extension/releases)

> Organiza tus fuentes de NotebookLM en carpetas virtuales — sin backend, sin tracking, 100% local.

---

![Texto alternativo descriptivo](https://raw.githubusercontent.com/francomoreira/notebooklm-folders-extension/refs/heads/main/video1.gif)

---

## ✨ Features

- 📂 **Carpetas virtuales** - Organiza fuentes en categorías
- 🎯 **Drag & Drop** - Arrastra fuentes entre carpetas
- ✏️ **Renombrable** - Haz clic en el nombre de carpeta para editar
- 💾 **Persistente** - Guarda tu estructura en localStorage (por cuaderno)
- 🔄 **Toggle Vista** - Alterna entre vista carpetas y lista original
- 🚀 **Zero backend** - Solo trabaja a nivel UI/frontend
- 🔒 **Privacidad total** - No tracking, no analytics, no backend calls

---

## 🚀 Instalación

### Opción 1: Desde Releases (Recomendado)

1. **Descargá** el último `.zip` desde [Releases](https://github.com/francomoreira/notebooklm-folders-extension/releases)
2. **Descomprimí** en una carpeta
3. En **Brave/Chrome**, andá a: `brave://extensions/` o `chrome://extensions/`
4. Activá **Modo desarrollador** (toggle arriba a la derecha)
5. **Cargar extensión sin empaquetar** → Seleccioná la carpeta descomprimida

### Opción 2: Desde código fuente

```bash
git clone https://github.com/francomoreira/notebooklm-folders-extension.git
cd notebooklm-folders-extension
# Cargar la carpeta en brave://extensions/
```

---

## 📖 Uso

1. **Abre NotebookLM** y entra a cualquier cuaderno
2. Espera **2 segundos** a que cargue la interfaz de carpetas
3. Verás **3 carpetas predeterminadas**:
   - Unidad 1
   - Unidad 2  
   - Unidad 3
   - 📥 Sin asignar (auto-creada si hay fuentes sin carpeta)

### Operaciones disponibles:

#### ➕ Crear carpeta
- Clic en **"+ Nueva Carpeta"**
- Ingresa el nombre
- ¡Listo!

#### ✏️ Renombrar carpeta
- Haz **clic en el nombre** de la carpeta
- Edita el texto
- Presiona **Enter** o haz clic fuera

#### 🗑️ Eliminar carpeta
- Clic en el **ícono de basura** 🗑️
- Confirma
- Las fuentes vuelven a "Sin asignar"

#### 📦 Mover fuentes
- **Expande una carpeta** (clic en ▶)
- **Arrastra la fuente** a otra carpeta
- Suelta para mover

#### 🔄 Cambiar vista
- Clic en **"📁 Vista Carpetas"** para alternar
- Vista Lista = lista original de NotebookLM
- Vista Carpetas = tu organización personalizada

---

## 🔧 Cómo funciona

```
Frontend (Tu navegador)          Backend (Google)
┌─────────────────────┐         ┌──────────────┐
│  Vista Carpetas     │         │              │
│  ┌───────────────┐  │         │  Lista plana │
│  │ Unidad 1      │  │  -----> │  de fuentes  │
│  │  - PDF A      │  │  Store  │              │
│  │  - PDF B      │  │  en     │  (sin        │
│  ├───────────────┤  │  local  │  cambios)    │
│  │ Unidad 2      │  │  Storage│              │
│  │  - PDF C      │  │         │              │
│  └───────────────┘  │         └──────────────┘
└─────────────────────┘
```

**Datos guardados:**
```javascript
localStorage["notebooklm_folders_12345"] = {
  "folders": {
    "Unidad 1": ["source_id_1", "source_id_2"],
    "Unidad 2": ["source_id_3"]
  },
  "unassigned": ["source_id_4"]
}
```

**Google NO ve tus carpetas** - Solo existen en tu navegador.

---

## 🐛 Troubleshooting

### "No aparece la interfaz de carpetas"

1. **Refresca la página** (F5)
2. Espera **3-4 segundos** después de cargar
3. Verifica que estés en: `https://notebooklm.google.com/notebook/*`
4. Abre **Consola del desarrollador** (F12) y busca errores

### "Se perdieron mis carpetas"

- Las carpetas se guardan **por cuaderno**
- Si cambiaste de cuaderno, cada uno tiene su propia estructura
- Verifica `localStorage` en DevTools > Application > Local Storage

### "Drag and Drop no funciona"

- Asegúrate de **expandir la carpeta destino** primero (▶)
- Arrastra sobre el **área gris** dentro de la carpeta
- Si persiste, recarga la página

### "La lista original desapareció"

- Clic en **"📋 Vista Lista"** para volver
- La extensión solo **oculta** la lista, no la elimina

---

## 🤝 Contribuir

¿Encontraste un bug? ¿Tenés una idea?

1. Abrí un [Issue](https://github.com/francomoreira/notebooklm-folders-extension/issues)
2. Hacé un fork del repo
3. Creá una branch: `git checkout -b feature/mi-mejora`
4. Commit: `git commit -m "Add: descripción"`
5. Push: `git push origin feature/mi-mejora`
6. Abrí un Pull Request

---

## 🔒 Privacidad & Seguridad

✅ **Zero tracking** — No hay analytics ni telemetría  
✅ **Zero backend** — No se conecta a ningún servidor  
✅ **Zero permisos innecesarios** — Solo `storage` y `notebooklm.google.com`  
✅ **Código público** — Podés auditar cada línea  

**Permisos solicitados:**
- `storage`: Para guardar tu estructura de carpetas en localStorage
- `https://notebooklm.google.com/*`: Para inyectar la UI en NotebookLM

---

## 🛠️ Stack Técnico

- **Vanilla JavaScript** (sin frameworks, ~15KB total)
- **CSS3** (sin librerías externas)
- **Manifest V3** (compatible con Chrome/Brave/Edge)
- **localStorage API** (persistencia local)

---

## 📝 Notas

- Las carpetas son **solo visuales** - NotebookLM sigue viendo lista plana
- Funciona **offline** una vez instalada
- Compatible con **Brave, Chrome, Edge, Opera**
- Tamaño: **~15KB** total

---

## 🚨 Limitaciones conocidas

1. **NotebookLM puede cambiar su UI** → La extensión podría romperse
2. **No sincroniza entre navegadores** → localStorage es local
3. **Nombres de fuentes largos** pueden verse cortados (max-width CSS)

---

## 📄 Licencia

MIT License — Hacé lo que quieras con esto.

Ver [LICENSE](LICENSE) para detalles.

---

## 🙏 Créditos

- **Desarrollado con:** Claude Sonnet 4.5 (Anthropic)
- **Inspiración:** Necesidad personal de organizar documentos en NotebookLM

---

![Texto alternativo descriptivo](https://raw.githubusercontent.com/francomoreira/notebooklm-folders-extension/refs/heads/main/video1.gif)

---

---

**¿Te sirvió?** Dale ⭐ al repo!
