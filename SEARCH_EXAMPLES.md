# 🔍 Ejemplos de Búsqueda - Milky Way Explorer

El Milky Way Explorer puede buscar objetos astronómicos de múltiples formas:

## ⚠️ Importante: Sistema Solar

**Los planetas individuales no funcionan bien en este explorador.**

### ¿Por qué no funcionan los planetas?

1. **Están muy cerca y son muy brillantes** - los surveys (WISE, 2MASS, DSS2) están optimizados para objetos distantes y tenues
2. **Se mueven constantemente** - sus coordenadas cambian cada día
3. **Requieren equipos especializados** - telescopios planetarios, no surveys de cielo profundo

### 🌍 Sistema Solar - Términos Educativos

En su lugar, estos términos te llevan a objetos relacionados:

```
Sistema Solar → Nebulosa de Orión (M42) 
                Donde nacen sistemas planetarios ahora mismo

Sol → Centro Galáctico (Sagitario A*) 
      Contexto galáctico de nuestro Sol (26,000 años luz del centro)

Tierra → M42 
         Cuna de formación planetaria (así nació la Tierra hace 4,600 millones de años)

Luna → Pléyades (M45) 
       Estrellas hermanas que nacieron juntas (como la Luna y la Tierra)
```

**Recomendación**: Para observar planetas usa software especializado como Stellarium o SkySafari.

---

## 📍 Por Coordenadas

Formatos soportados:
- **Decimal**: `266.41683 -29.00781`
- **HMS/DMS**: `17:45:40 -28:56:10`
- **Mixto**: `17h45m40s -28d56m10s`

### Ejemplos:
```
266.41683 -29.00781    # Centro Galáctico (decimal)
17:45:40 -28:56:10     # Centro Galáctico (HMS/DMS)
05:35:17.3 -05:23:28   # Nebulosa de Orión
```

## 🌟 Por Nombre de Objeto

Usa la base de datos **SIMBAD** (4M+ objetos astronómicos):

### Nebulosas
```
M42                    # Nebulosa de Orión
Orion Nebula          # Nebulosa de Orión (nombre completo)
Crab Nebula           # Nebulosa del Cangrejo
Eagle Nebula          # Nebulosa del Águila (M16)
Lagoon Nebula         # Nebulosa de la Laguna (M8)
Trifid Nebula         # Nebulosa Trífida (M20)
Ring Nebula           # Nebulosa del Anillo (M57)
Dumbbell Nebula       # Nebulosa Dumbbell (M27)
Horsehead Nebula      # Nebulosa Cabeza de Caballo
```

### Estrellas
```
Betelgeuse            # Supergigante roja en Orión
Rigel                 # Estrella azul brillante en Orión
Sirius                # Estrella más brillante del cielo
Vega                  # Estrella principal de Lira
Antares               # Supergigante roja en Escorpio
Aldebaran             # Gigante naranja en Tauro
Polaris               # Estrella Polar
Proxima Centauri      # Estrella más cercana al Sol
```

### Cúmulos Estelares
```
Pleiades              # Cúmulo de las Pléyades (M45)
M45                   # Las Siete Hermanas
Hyades                # Cúmulo de las Híades
M7                    # Cúmulo de Ptolomeo
M13                   # Gran Cúmulo de Hércules
M22                   # Cúmulo globular en Sagitario
NGC 869               # Cúmulo doble de Perseo
NGC 884               # Cúmulo doble de Perseo
```

### Galaxias
```
M31                   # Galaxia de Andrómeda
Andromeda Galaxy      # Galaxia de Andrómeda (nombre completo)
M33                   # Galaxia del Triángulo
Triangulum Galaxy     # Galaxia del Triángulo (nombre completo)
M51                   # Galaxia del Remolino
Whirlpool Galaxy      # Galaxia del Remolino (nombre completo)
M87                   # Galaxia elíptica con agujero negro
Sombrero Galaxy       # Galaxia del Sombrero (M104)
```

### Objetos de la Vía Láctea
```
Sgr A*                # Agujero negro supermasivo central
Cygnus X-1            # Candidato a agujero negro
Eta Carinae           # Sistema estelar masivo
Cassiopeia A          # Remanente de supernova
Vela Pulsar           # Púlsar en remanente de supernova
```

## 🔤 Por Keywords (regiones predefinidas)

```
Cygnus X              # Región de formación estelar
centro galáctico      # Centro de la Vía Láctea
orion                 # Región de Orión
formación estelar     # Áreas de formación estelar
polvo interestelar    # Regiones con polvo
```

## 💡 Consejos

1. **Usa nombres estándar**: SIMBAD reconoce miles de nombres alternativos
2. **Prueba variaciones**: "M42", "Orion Nebula", "NGC 1976" son el mismo objeto
3. **Coordenadas precisas**: Para objetos específicos, usa coordenadas exactas
4. **Explora sugerencias**: Cada búsqueda sugiere los mejores surveys para ese tipo de objeto

## 🎯 Objetos Populares para Probar

### En el Hemisferio Norte
- M42 (Orión)
- Pleiades
- Andromeda Galaxy
- Betelgeuse
- Polaris

### En el Hemisferio Sur
- Eta Carinae
- Tarantula Nebula
- Small Magellanic Cloud
- Large Magellanic Cloud
- Alpha Centauri

### Visibles desde ambos hemisferios
- Sirius
- Vega
- M31
- Crab Nebula
- Ring Nebula

## 🌌 Regiones de la Vía Láctea

```
Centro Galáctico      # RA: 266.4°, Dec: -29.0°
Cygnus X              # RA: 308.5°, Dec: 41.0°
Orion Complex         # RA: 83.8°, Dec: -5.4°
Taurus Molecular      # RA: 65.5°, Dec: 15.8°
Carina Nebula         # RA: 161.3°, Dec: -59.9°
```

---

**Nota**: El sistema usa SIMBAD (Centre de Données astronomiques de Strasbourg) para resolver nombres de objetos, que contiene información de más de 11 millones de objetos astronómicos conocidos.

---

## 🎓 Aprende Más

- **SIMBAD**: Base de datos astronómica con 11+ millones de objetos
- **Surveys infrarrojos**: WISE, 2MASS capturan polvo y objetos fríos
- **Surveys ópticos**: DSS2 muestra luz visible
- **Surveys UV**: GALEX detecta estrellas jóvenes y calientes

---

**Powered by:**
- 🌌 **SIMBAD/CDS Sesame Service** - Resolución de nombres astronómicos
- 🛰️ **NASA/IPAC IRSA** - Infrared Science Archive
- 🔭 **NASA SkyView** - Virtual Observatory
- ⭐ **Aladin Lite v3** - Interactive Sky Atlas

