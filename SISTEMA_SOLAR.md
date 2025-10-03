# 🌍 Sistema Solar en Milky Way Explorer

## ⚠️ Limitación Técnica

Los **planetas individuales no son viables** en este explorador de cielo profundo.

### ¿Por qué NO funcionan los planetas?

1. **Instrumentación incorrecta**
   - Los surveys (WISE, 2MASS, DSS2) están diseñados para objetos **distantes y tenues**
   - Los planetas son **muy brillantes y muy cercanos** → saturan los sensores
   - Se requieren telescopios planetarios especializados

2. **Coordenadas cambiantes**
   - Los planetas se mueven diariamente en el cielo
   - Las coordenadas quedan obsoletas rápidamente
   - Se necesita software de efemérides (Stellarium, SkySafari)

3. **FOV inadecuado**
   - Los planetas requieren FOV muy pequeños (0.1° - 0.5°)
   - Los surveys están optimizados para FOV grandes (2° - 6°)

---

## ✅ Solución: Términos Educativos

En lugar de mostrar planetas (que no se ven bien), redirigimos a **objetos educativos relacionados**:

### 🌌 Sistema Solar → Nebulosa de Orión (M42)

**RA:** 83.818662° **Dec:** -5.389679° **FOV:** 4°

**¿Por qué M42?**
- Es una **región de formación planetaria activa AHORA MISMO**
- Muestra cómo se veía la región donde nació nuestro Sistema Solar hace 4,600 millones de años
- Contiene protoplanetary disks (proplyds) - sistemas planetarios en formación

**Mensaje educativo:**
> "🌌 Sistema Solar - Te mostramos la Nebulosa de Orión (M42), donde se están formando nuevos sistemas planetarios ahora mismo. Así se veía la región donde nació nuestro Sistema Solar hace 4,600 millones de años."

**Surveys sugeridos:** WISE W4 (22µm), WISE W3 (12µm), DSS2 Red

---

### ☀️ Sol → Centro Galáctico (Sagitario A*)

**RA:** 266.41683° **Dec:** -29.00781° **FOV:** 6°

**¿Por qué Sagitario A*?**
- Muestra el **contexto galáctico** de nuestro Sol
- Nuestro Sol orbita alrededor de este agujero negro supermasivo
- Distancia: ~26,000 años luz del centro

**Mensaje educativo:**
> "☀️ El Sol - Nuestro Sol es una estrella tipo G2V a 26,000 años luz del Centro Galáctico. Te mostramos Sagitario A*, el agujero negro supermasivo de 4 millones de masas solares en el corazón de la Vía Láctea."

**Surveys sugeridos:** WISE W3 (12µm), 2MASS K, DSS2 Red

---

### 🌍 Tierra → Nebulosa de Orión (M42)

**RA:** 83.818662° **Dec:** -5.389679° **FOV:** 3°

**¿Por qué M42?**
- Representa la **cuna de formación planetaria**
- Así nació la Tierra hace 4,600 millones de años
- Muestra el proceso de acreción planetaria

**Mensaje educativo:**
> "🌍 La Tierra - Nuestro hogar en el cosmos. Te mostramos M42, donde se forman nuevos planetas. Así nació la Tierra hace 4,600 millones de años."

**Surveys sugeridos:** WISE W4 (22µm), WISE W3 (12µm), GALEX FUV

---

### 🌙 Luna → Pléyades (M45)

**RA:** 56.869089° **Dec:** 24.105313° **FOV:** 2°

**¿Por qué las Pléyades?**
- Representa **estrellas hermanas** que nacieron juntas
- Concepto: la Luna y la Tierra también nacieron del mismo material
- Cúmulo estelar joven (~100 millones de años)

**Mensaje educativo:**
> "🌙 La Luna - Formada hace 4,500 millones de años por un impacto masivo. Te mostramos las Pléyades (M45), un cúmulo estelar joven donde las estrellas nacieron juntas."

**Surveys sugeridos:** 2MASS K, DSS2 Red, WISE W1

---

## 🎯 Implementación Técnica

### Código en `search.ts`

```typescript
const solarSystemMap: Record<string, { ra: number; dec: number; fov: number; note: string; surveys: string[] }> = {
  // Sistema Solar general
  'sistema solar': {
    ra: 83.818662,
    dec: -5.389679,
    fov: 4,
    note: '🌌 Sistema Solar - Te mostramos la Nebulosa de Orión (M42)...',
    surveys: ['wise_w4', 'wise_w3', 'dss2_red']
  },
  
  // Sol
  'sol': {
    ra: 266.41683,
    dec: -29.00781,
    fov: 6,
    note: '☀️ El Sol - Nuestro Sol es una estrella tipo G2V...',
    surveys: ['wise_w3', '2mass_k', 'dss2_red']
  },
  
  // Tierra
  'tierra': {
    ra: 83.818662,
    dec: -5.389679,
    fov: 3,
    note: '🌍 La Tierra - Nuestro hogar en el cosmos...',
    surveys: ['wise_w4', 'wise_w3', 'galex_fuv']
  },
  
  // Luna
  'luna': {
    ra: 56.869089,
    dec: 24.105313,
    fov: 2,
    note: '🌙 La Luna - Formada hace 4,500 millones de años...',
    surveys: ['2mass_k', 'dss2_red', 'wise_w1']
  }
};
```

### Términos Reconocidos

- **Sistema Solar**: "sistema solar", "solar system"
- **Sol**: "sol", "sun"
- **Tierra**: "tierra", "earth"
- **Luna**: "luna", "moon"

**No hay términos individuales** para: Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno

---

## 📚 Conceptos Astronómicos

### Formación Planetaria (M42)

La Nebulosa de Orión es una **maternidad estelar activa**:
- Contiene ~700 estrellas en formación
- Proplyds: discos protoplanetarios donde nacen planetas
- Edad: ~1-3 millones de años (muy joven)
- Distancia: ~1,344 años luz

### Contexto Galáctico (Sagitario A*)

Nuestro Sol orbita el centro galáctico:
- Período orbital: ~225-250 millones de años
- Velocidad orbital: ~220 km/s
- Sagitario A*: agujero negro de 4 millones de masas solares
- Distancia: ~26,000 años luz

### Cúmulos Estelares (Pléyades)

Las Pléyades muestran estrellas co-natales:
- Edad: ~100 millones de años
- ~1,000 estrellas confirmadas
- Distancia: ~444 años luz
- Concepto: estrellas nacidas del mismo material (como Tierra-Luna)

---

## 🔬 Alternativas para Observar Planetas

Si quieres observar planetas del Sistema Solar, usa:

1. **Software de Planetario**
   - Stellarium (gratis, multiplataforma)
   - SkySafari (móvil)
   - Cartes du Ciel

2. **Telescopios Especializados**
   - Refractores planetarios
   - Schmidt-Cassegrain
   - Maksutov-Cassegrain

3. **Observatorios Online**
   - Slooh
   - Virtual Telescope Project

---

## ✅ Resultado Final

**Antes (no viable):**
```
Usuario: "Júpiter"
Sistema: Muestra coordenadas obsoletas → imagen saturada/vacía
```

**Después (educativo):**
```
Usuario: "Sistema Solar"
Sistema: Muestra M42 → región de formación planetaria activa
Mensaje: Explica conexión educativa
```

**Ventajas:**
- ✅ Imágenes de calidad (objetos adecuados para los surveys)
- ✅ Valor educativo (conceptos astronómicos relacionados)
- ✅ Siempre relevante (coordenadas fijas, no cambian)
- ✅ Contexto científico (formación planetaria, contexto galáctico)

---

**Conclusión:** En lugar de mostrar planetas que no funcionan, mostramos objetos que **ilustran los conceptos astronómicos** detrás del Sistema Solar.
