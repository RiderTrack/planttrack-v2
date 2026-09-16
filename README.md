# 🌿 PlantTrack V2

**Tu jardín digital con IA** — identificás plantas por foto, aprendés sus cuidados, abonos y plagas, y llevás el riego de cada una. De la familia Track (RiderTrack · WalletTrack · FitTrack → **PlantTrack**).

## 📱 ¿Qué es?

PlantTrack V2 es una app de jardinería con inteligencia artificial: le sacás una foto a una planta y Claude (Anthropic) te devuelve una **ficha botánica completa** — especie, confianza de identificación, riego, luz, temperatura, sustrato, abono con dosis, plagas típicas y tips de oro. Guardás la planta en **Mi Jardín** y la app te dice cuándo regarla.

| Módulo | Qué hace |
|--------|----------|
| 📸 Identificar | Foto → IA Claude → ficha completa con % de confianza |
| 💧 Cuidados | Riego (frecuencia + cantidad), luz, temperatura, humedad, sustrato, poda |
| 🧪 Abonos | Tipo de fertilizante, dosis exacta, frecuencia y época del año |
| 🐛 Plagas | Enfermedades típicas de la especie con síntomas y tratamiento |
| 🌱 Mi Jardín | Plantas guardadas, calendario de riego, notas y ajuste de frecuencia |
| 💬 Chat botánico | Conversá con la IA sobre tus plantas (con contexto de tu jardín) |
| 🎨 Temas | Oscuro (default) / claro / auto — patrón RiderTrack |

## 🧱 Stack técnico

- **React 19 + TypeScript + Vite 6**
- **Tailwind CSS 4** + Lucide (íconos) + Motion (animaciones)
- **Capacitor 6** — empaqueta la web como APK Android
- **Claude API (Anthropic)** — visión: identificación y chat botánico
- **localStorage** — jardín, notas, chat y config (Firebase en v2.1 🔜)

## 📁 Estructura (modular, igual que RiderTrack V2)

```
src/
├── App.tsx            # Orquestador: pestañas + toasts + arranque nativo
├── components/        # Una vista por módulo
│   ├── DashboardView.tsx      # Resumen + próximos riegos + consejo del día
│   ├── IdentificarView.tsx    # Foto → análisis IA → resultado
│   ├── FichaPlanta.tsx        # Tarjeta botánica completa (reutilizable)
│   ├── JardinView.tsx         # Grid del jardín + detalle (riego/notas/share)
│   ├── ChatBotanicoView.tsx   # Chat con el botánico IA
│   ├── AjustesView.tsx        # Token Claude, modelo, tema, respaldo
│   ├── Header.tsx / BottomNav.tsx / Toast.tsx
├── services/
│   ├── claude.ts      # API de Claude: transporte dual APK/Web + modo demo
│   ├── camara.ts      # Capacitor Camera + fallback web
│   ├── jardin.ts      # CRUD localStorage + respaldo JSON
│   └── plataforma.ts  # Detección nativo/web
├── hooks/
│   └── useJardin.ts   # Estado reactivo del jardín
├── theme/             # Tema claro/oscuro (inversión de variables CSS)
├── utils/             # imagen (resize), riego (calendario)
├── data/              # Fichas demo + consejos del día
└── types.ts           # Contratos compartidos
```

## 🔑 Configurar la IA (una sola vez)

1. Conseguí tu token en **console.anthropic.com → API Keys** (sk-ant-…)
2. En la app: **Ajustes → IA de Claude** → pegá el token → **Probar** → **Guardar**
3. Listo: identificación real y chat botánico activados. El token vive SOLO en tu dispositivo.

> Sin token la app funciona en **modo demo**: fichas de ejemplo para probar toda la interfaz.

## 🚀 Desarrollo

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo (localhost:3000)
npm run lint       # verificación de tipos (tsc)
npm run build      # build de producción → dist/
```

## 📦 Generar el APK (sin PC — desde GitHub)

1. Entrá al repo → pestaña **Actions** → **Build PlantTrack APK**
2. Ejecutá el workflow (o hacé push a `main` — se dispara solo)
3. Al terminar, descargá el artifact **PlantTrackV2-APK**
4. Instalá el `.apk` en tu celular (permití orígenes desconocidos)

> Para firmar siempre con la misma clave: subí `KEYSTORE_BASE64` a los Secrets del repo (base64 de tu keystore). Sin secret se genera uno nuevo en cada build.

## ☁️ Roadmap

- [ ] v2.1 — Firebase Auth + Firestore (jardín en la nube, multi-dispositivo)
- [ ] Notificaciones locales de riego
- [ ] Detección de plagas en la foto misma
- [ ] Recordatorios de abono por época del año
