# Guía rápida de instalación de libvips en Windows

## Método 1: Descarga directa (Recomendado)

1. **Descarga libvips para Windows:**
   https://github.com/libvips/build-win64-mxe/releases

2. **Descarga el archivo más reciente:**
   - Busca `vips-dev-w64-all-X.Y.Z.zip` (ej: vips-dev-w64-all-8.15.1.zip)
   - Descarga (~30 MB)

3. **Extraer:**
   - Extrae a `C:\vips` (o donde prefieras)
   - Deberías tener: `C:\vips\bin\vips.exe`

4. **Agregar al PATH:**
   ```powershell
   # Ejecuta como Administrador
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\vips\bin", "Machine")
   ```

5. **Reinicia PowerShell** y verifica:
   ```powershell
   vips --version
   ```

6. **Genera tiles:**
   ```powershell
   cd C:\Users\daniz\Documents\GitHub\spaceapps
   vips dzsave andromeda_wiki.jpg andromeda_wiki --suffix .jpg[Q=90]
   ```

7. **Actualiza .env:**
   ```powershell
   # El archivo frontend\.env ya está configurado, solo cambia esta línea:
   # VITE_TILES_URL=http://localhost:8080/andromeda_wiki.dzi
   ```

8. **Sirve los tiles:**
   ```powershell
   npx http-server . -p 8080 --cors
   ```

## Método 2: Con Chocolatey (si lo tienes instalado)

```powershell
choco install libvips
```

## Método 3: Con MSYS2 (para desarrolladores)

```bash
pacman -S mingw-w64-x86_64-libvips
```

## Verificar instalación

```powershell
vips --version
# Debería mostrar: vips-8.15.1 ...
```

## Generar tiles después de instalar

```powershell
cd C:\Users\daniz\Documents\GitHub\spaceapps
vips dzsave andromeda_wiki.jpg andromeda_wiki --suffix .jpg[Q=90]
```

## Troubleshooting

### "vips no es un comando reconocido"
- Verifica que agregaste al PATH
- Reinicia PowerShell (o toda la terminal)
- Verifica ruta: `C:\vips\bin\vips.exe`

### "Error: unable to load library"
- Descarga la versión "all" que incluye todas las DLLs
- No uses la versión "web" o "minimal"

### "Out of memory"
- Reduce la calidad: `--suffix .jpg[Q=80]`
- Cierra otras aplicaciones
- Usa una imagen más pequeña

## Siguiente paso

Una vez generados los tiles:

```powershell
# Terminal 1: Servir tiles
npx http-server . -p 8080 --cors

# Terminal 2: Backend
npm run dev

# Terminal 3: Frontend  
cd frontend ; npm run dev
```

Abre: http://localhost:5173
