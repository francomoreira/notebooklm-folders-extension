# 📁 NotebookLM Folders Extension

**Organiza tus fuentes de NotebookLM en carpetas virtuales**

## ✨ Features

- 📂 **Carpetas virtuales** - Organiza fuentes en categorías
- 🎯 **Drag & Drop** - Arrastra fuentes entre carpetas
- ✏️ **Renombrable** - Haz doble clic en el nombre de carpeta
- 💾 **Persistente** - Guarda tu estructura en localStorage
- 🔄 **Toggle Vista** - Alterna entre vista carpetas y lista original
- 🚀 **Zero backend** - Solo trabaja a nivel UI/frontend

---

## 🚀 Instalación en Brave

### Método 1: Cargar extensión sin empaquetar

1. **Abre Brave** y ve a: `brave://extensions/`

2. **Activa el modo desarrollador** (toggle arriba a la derecha)

3. **Clic en "Cargar extensión sin empaquetar"**

4. **Selecciona la carpeta** `notebooklm-folders-extension`

5. **¡Listo!** La extensión se activará automáticamente

### Método 2: Instalar como .crx (opcional)

```bash
# Comprimir carpeta
zip -r notebooklm-folders.zip notebooklm-folders-extension/
# Renombrar a .crx
mv notebooklm-folders.zip notebooklm-folders.crx
# Arrastrar .crx a brave://extensions/
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

## 🔒 Privacidad

- ✅ **Zero tracking**
- ✅ **Zero analytics**  
- ✅ **Zero backend calls**
- ✅ Datos guardados solo en **tu navegador**
- ✅ No requiere permisos de Drive/Calendar/etc

---

## 🛠️ Stack Técnico

- **Vanilla JavaScript** (sin frameworks)
- **CSS3** (sin Tailwind para reducir tamaño)
- **Manifest V3** (compatibilidad futura)
- **localStorage API** (persistencia)

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

## 🤝 Contribuciones

¿Mejoras? Edita directamente los archivos:
- `content.js` - Lógica principal
- `styles.css` - Estilos
- `manifest.json` - Configuración

---

## 📄 Licencia

MIT - Hacé lo que quieras con esto.

---

**Creado en 10 minutos por Claude Sonnet 4.5** 🚀  
*(vs. "40 minutos de IA" según Franco)* 😎
