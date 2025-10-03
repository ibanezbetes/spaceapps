# 🚀 START HERE - Milky Way Explorer

## ✅ TODO ESTÁ FUNCIONANDO

**Backend**: http://localhost:3000 ✅  
**Frontend**: http://localhost:5173 ✅

## 🎯 Qué Puedes Hacer AHORA

### 1. Abre la Aplicación
Ir a: **http://localhost:5173** en tu navegador

### 2. Prueba la Búsqueda

En la barra de búsqueda, prueba:

**Coordenadas**:
```
17:45:40 -28:56:10
266.41683 -29.00781
```

**Objetos Astronómicos**:
```
Cygnus X
M42
NGC 7000
```

**Keywords**:
```
polvo interestelar
regiones HII
centro galáctico
```

### 3. Quick Access Bookmarks
Haz clic en:
- **Centro Galáctico** → Sgr A*
- **Cygnus X** → Región de formación estelar
- **Nebulosa Orión** → M42

### 4. Navega en Aladin
- **Zoom**: Rueda del ratón / controles en pantalla
- **Pan**: Arrastra con el ratón
- **Fullscreen**: Botón en la interfaz
- **Grilla de coordenadas**: Activa/desactiva en controles

## 📡 Probar APIs Directamente

```bash
# Health check
curl http://localhost:3000/health

# Buscar coordenadas
curl "http://localhost:3000/api/search?q=17:45:40%20-28:56:10"

# Obtener metadata (surveys + catálogos)
curl http://localhost:3000/api/metadata

# Cone Search AllWISE (Orión)
curl "http://localhost:3000/api/catalogs/cone?ra=83.82&dec=-5.39&radius=0.2"

# Descargar cutout Centro Galáctico (PNG)
curl "http://localhost:3000/api/cutout/skyview?ra=266.41&dec=-29&size=4&survey=DSS2%20Red&format=PNG" -o galactic_center.png
```

## 📊 Lo Que Tienes

### 14 Surveys Astronómicos
- **IR**: WISE W1/W2/W3/W4, 2MASS J/H/Ks
- **Óptico**: DSS2 Red/Blue/IR
- **UV**: GALEX FUV/NUV
- **Radio**: NVSS, 408 MHz

### 2 Catálogos Masivos
- **AllWISE**: ~750M fuentes IR all-sky
- **2MASS**: ~470M fuentes NIR all-sky

### APIs Oficiales NASA
- **IRSA** (NASA/IPAC): Image Cutouts, SCS, TAP
- **SkyView** (NASA/GSFC): Multi-survey cutouts
- **Aladin Lite v3**: Visor astronómico CDS

## 🎨 Capturas de Pantalla

### Búsqueda Funcional
![image](https://github.com/user-attachments/assets/...)

### Aladin Lite v3 Integrado
![image](https://github.com/user-attachments/assets/...)

## 📝 Documentación

- `MILKYWAY_README.md` → Docs técnicas completas
- `REFACTOR_SUMMARY.md` → Resumen del refactor
- `install.ps1` → Script de instalación
- `start.ps1` → Iniciar ambos servidores juntos

## 🛠️ Comandos Útiles

```bash
# Detener todos los servidores
Ctrl+C en cada terminal

# Reinstalar dependencias
npm install
cd client && npm install

# Verificar puertos
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Matar procesos Node
taskkill /F /IM node.exe
```

## ✨ Próximas Mejoras

1. **LayerPanel**: Toggle de surveys con opacidad
2. **CatalogList**: Visualizar marcadores de SCS
3. **Inspector**: Clic en el cielo → info + enlaces

## 🎉 ¡Disfruta Explorando la Vía Láctea!

Todo está listo y funcionando. El backend responde a todas las APIs de NASA y el frontend renderiza Aladin Lite v3 correctamente.

**¡Buena suerte con el demo! 🌌✨**
