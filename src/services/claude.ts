// ═══════════════════════════════════════════════════════════
// 🤖 PLANTTRACK V2 — services/claude.ts
// Conexión con la API de Claude (Anthropic) para:
//   • Identificar plantas por foto (visión → JSON estructurado)
//   • Chat botánico multi-turno
//
// Blindajes heredados de RiderTrack (riderChatApi.ts):
//   • Transporte dual: APK → CapacitorHttp (nativo OkHttp, sin
//     CORS), Web → fetch directo con el header de acceso browser
//   • Modo demo determinístico (sin token → fichas de ejemplo
//     para probar TODA la interfaz antes de configurar la IA)
//   • Errores traducidos al español, nunca crashea la vista
// ═══════════════════════════════════════════════════════════

import { CapacitorHttp } from '@capacitor/core';
import type { ConfigIA, FichaPlanta, MensajeChat, RespuestaIA, VerificacionRegional, AnalisisProducto, DiagnosticoPlaga } from '../types';
import { esNativo } from './plataforma';
import { FICHAS_DEMO, elegirFichaDemo, PRODUCTO_DEMO, PLAGA_DEMO } from '../data/demo';

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/** Modelos vigentes del lineup oficial de Anthropic (sept 2026).
 *  ⚠️ Anthropic JUBILA modelos antiguos (Sonnet 4/3.7/3.5 murieron en
 *  2026) — cada tanto revisar docs: platform.claude.com/docs/models-overview.
 *  Precios por millón de tokens (entra/sale USD):
 *  Sonnet 5 $2/$10 · Haiku 4.5 $1/$5 · Opus 5 $5/$25 · Fable 5.1 $10/$50 */
export const MODELOS_CLAUDE = [
  { id: 'claude-sonnet-5', nombre: 'Claude Sonnet 5 — recomendado', vista: true },
  { id: 'claude-haiku-4-5-20251001', nombre: 'Claude Haiku 4.5 — económico', vista: true },
  { id: 'claude-opus-5', nombre: 'Claude Opus 5 — máximo detalle', vista: true },
  { id: 'claude-fable-5-1', nombre: 'Claude Fable 5.1 — el más nuevo', vista: true },
] as const;

export const MODELO_DEFAULT = 'claude-sonnet-5';

/** Migración de IDs jubilados → equivalente vigente. Así nadie
 *  queda trabado con un modelo muerto guardado en localStorage. */
const MIGRACION_MODELOS: Record<string, string> = {
  'claude-sonnet-4-20250514': 'claude-sonnet-5',   // jubilado 15-jun-2026
  'claude-3-7-sonnet-20250219': 'claude-sonnet-5', // jubilado antes
  'claude-3-5-haiku-20241022': 'claude-haiku-4-5-20251001', // jubilado
  'claude-sonnet-4-5': 'claude-sonnet-5',
};

// ── Configuración persistente (localStorage) ────────────────

const LS_CONFIG = 'planttrack.ia';

export function leerConfigIA(): ConfigIA {
  try {
    const crudo = localStorage.getItem(LS_CONFIG);
    if (crudo) {
      const cfg = JSON.parse(crudo) as ConfigIA;
      // 🩹 v1.0.3: migrar modelos jubilados (o desconocidos) al vigente
      // más cercano — el usuario no puede quedar trabado con un modelo muerto.
      const idsValidos = MODELOS_CLAUDE.map(m => m.id);
      if (!idsValidos.includes(cfg.modelo as never)) {
        cfg.modelo = MIGRACION_MODELOS[cfg.modelo] || MODELO_DEFAULT;
        localStorage.setItem(LS_CONFIG, JSON.stringify(cfg));
      }
      return cfg;
    }
  } catch { /* storage corrupto → default */ }
  return { token: '', modelo: MODELO_DEFAULT, pais: '' };
}

export function guardarConfigIA(cfg: ConfigIA): void {
  localStorage.setItem(LS_CONFIG, JSON.stringify(cfg));
}

export function hayToken(): boolean {
  return leerConfigIA().token.trim().length > 10;
}

// ── Transporte dual (inyectable para tests) ─────────────────

interface PeticionIA {
  system: string;
  mensajes: { rol: 'user' | 'assistant'; contenido: any[] }[];
  maxTokens?: number;
}

async function llamarClaude(pet: PeticionIA, cfg: ConfigIA): Promise<string> {
  const body = {
    model: cfg.modelo || MODELO_DEFAULT,
    max_tokens: pet.maxTokens ?? 3000,
    system: pet.system,
    messages: pet.mensajes.map(m => ({ role: m.rol, content: m.contenido })),
  };
  const headers: Record<string, string> = {
    'x-api-key': cfg.token.trim(),
    'anthropic-version': ANTHROPIC_VERSION,
    'content-type': 'application/json',
  };

  if (esNativo()) {
    // APK: CapacitorHttp → OkHttp nativo, sin CORS ni preflight
    const r = await CapacitorHttp.post({ url: API_URL, headers, data: body });
    if (r.status >= 400) {
      throw new Error(traducirError(r.data?.error?.message || `HTTP ${r.status}`));
    }
    const textos = (r.data?.content || []) as { type: string; text?: string }[];
    const texto = textos.filter(b => b.type === 'text').map(b => b.text || '').join('\n').trim();
    if (!texto) throw new Error('Claude devolvió una respuesta vacía — reintenta.');
    return texto;
  }

  // Web: fetch con el header oficial para acceso directo del navegador
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: { ...headers, 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    throw new Error(traducirError(data?.error?.message || `HTTP ${r.status}`));
  }
  const textos = (data?.content || []) as { type: string; text?: string }[];
  const texto = textos.filter(b => b.type === 'text').map(b => b.text || '').join('\n').trim();
  if (!texto) throw new Error('Claude devolvió una respuesta vacía — reintenta.');
  return texto;
}

/** Traduce los errores comunes de Anthropic al español. */
function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid x-api-key') || m.includes('authentication'))
    return 'El token de Claude no es válido. Revísalo en Ajustes.';
  if (m.includes('credit') || m.includes('balance') || m.includes('billing'))
    return 'Tu cuenta de Claude no tiene crédito disponible.';
  if (m.includes('rate limit') || m.includes('429'))
    return 'Demasiadas consultas seguidas — espera unos segundos.';
  if (m.includes('overloaded') || m.includes('529'))
    return 'Los servidores de Claude están saturados — reintenta en un momento.';
  if (m.includes('not_found_error') || m.includes('model'))
    return 'Ese modelo ya no existe en Claude (lo jubilaron). Actualizá la app o elegí otro en Ajustes.';
  if (m.includes('image is too large'))
    return 'La foto es muy pesada. Tómala desde más lejos o con menos resolución.';
  return msg.slice(0, 180);
}

// ── 1) Identificación de planta por foto ────────────────────

const SYSTEM_IDENTIFICAR = `Eres un botánico experto en plantas de interior, exterior, jardinería urbana Y plantas de uso culinario/regional de toda Latinoamérica y el mundo (ajíes, hierbas, frutas, tubérculos andinos, etc). Analizas fotos y respondes ÚNICAMENTE con un JSON válido (sin markdown, sin \`\`\`, sin texto antes o después) con EXACTAMENTE esta estructura en español:

{
  "esPlanta": boolean,
  "nombreComun": "string",
  "nombreCientifico": "string",
  "familia": "string",
  "nombresRegionales": [{ "region": "país o zona", "nombre": "cómo se llama ahí" }],
  "confianza": number entre 0 y 100,
  "descripcion": "2-3 frases sobre la planta",
  "toxicidad": "según mascotas y humanos",
  "dificultad": "facil" | "media" | "dificil",
  "erroresComunes": ["los 3 errores que suelen MATAR esta especie, específicos de la especie"],
  "cuidados": {
    "riego": {
      "frecuenciaDias": number,
      "frecuenciaTexto": "ej: Cada 7 días en verano",
      "cantidad": "cuánta agua por riego",
      "consejos": ["2-3 consejos"]
    },
    "luz": "cantidad y tipo de luz",
    "temperatura": { "minima": number, "maxima": number, "ideal": "rango ideal" },
    "humedad": "humedad ambiente",
    "sustrato": "tierra recomendada",
    "poda": "cuándo y cómo podar"
  },
  "abono": {
    "tipo": "tipo de fertilizante",
    "dosis": "dosis exacta",
    "frecuencia": "cada cuánto aplicar",
    "epoca": "época del año",
    "consejos": ["1-2 consejos"]
  },
  "plagas": [{ "nombre": "plaga", "sintomas": "qué se observa", "tratamiento": "cómo tratarla" }],
  "consejosExtra": ["2-3 tips de oro"]
}

Reglas:
- Si la foto NO contiene una planta: esPlanta=false, confianza=0, nombreComun="No es una planta", descripcion explica qué se ve, y el resto de campos con strings vacías / 0 / listas vacías.
- plagas: incluye 2-4 plagas/enfermedades TÍPICAS de esa especie.
- nombresRegionales: OBLIGATORIO cuando existan. Lista 3-8 nombres comunes que recibe esta especie en distintos países/regiones hispanohablantes y el nombre en inglés si es conocido (ej: ají charapita en Perú, chiltepe en Guatemala, bird pepper en EE.UU.). Cubre frutas, hierbas, hortalizas y ornamentales.
- erroresComunes: exactamente 3, específicos de ESTA especie (nada genérico), estilo "Regarla a diario: sus raíces se ahogan por falta de oxígeno".
- Si dudas entre dos especies, elige la más probable y baja la confianza acorde.
- Responde SOLO el JSON.`;

export async function identificarPlanta(
  imagenBase64: string, // sin el prefijo data:
  mediaType: string,
  extra?: string, // contexto: país del usuario, pistas…
): Promise<RespuestaIA> {
  const cfg = leerConfigIA();

  // Modo demo (sin token): ficha determinística por hash de imagen
  if (!cfg.token.trim()) {
    await new Promise(r => setTimeout(r, 1600)); // simula pensar
    const ficha = elegirFichaDemo(imagenBase64);
    return { ok: true, texto: JSON.stringify(ficha), modoDemo: true };
  }

  try {
    const texto = await llamarClaude({
      system: SYSTEM_IDENTIFICAR,
      mensajes: [{
        rol: 'user',
        contenido: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imagenBase64 } },
          { type: 'text', text: extra?.trim()
            ? `Identifica esta planta y devuelve el JSON completo. Contexto del usuario: ${extra.trim()}`
            : 'Identifica esta planta y devuelve el JSON completo.' },
        ],
      }],
      // 8000: los modelos 2026 usan "adaptive thinking" (razonamiento
      // interno que consume tokens del presupuesto) — con 3000 podía
      // quedar corta la respuesta y venir truncada.
      maxTokens: 8000,
    }, cfg);
    return { ok: true, texto: limpiarJSON(texto) };
  } catch (e: any) {
    return { ok: false, texto: '', error: e?.message || 'Error inesperado llamando a Claude.' };
  }
}

/** Quita fences ```json y espacios para poder hacer JSON.parse. */
function limpiarJSON(texto: string): string {
  return texto
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/** Parsea con validación y valores por defecto — nunca crashea. */
export function parsearFicha(textoJSON: string): FichaPlanta {
  const base: FichaPlanta = {
    esPlanta: false, nombreComun: '', nombreCientifico: '', familia: '',
    confianza: 0, descripcion: '', toxicidad: '', dificultad: 'media',
    nombresRegionales: [], erroresComunes: [],
    cuidados: {
      riego: { frecuenciaDias: 7, frecuenciaTexto: '', cantidad: '', consejos: [] },
      luz: '', temperatura: { minima: 0, maxima: 0, ideal: '' },
      humedad: '', sustrato: '', poda: '',
    },
    abono: { tipo: '', dosis: '', frecuencia: '', epoca: '', consejos: [] },
    plagas: [], consejosExtra: [],
  };
  try {
    const p = JSON.parse(textoJSON);
    return {
      ...base, ...p,
      confianza: Math.max(0, Math.min(100, Number(p?.confianza) || 0)),
      nombresRegionales: Array.isArray(p?.nombresRegionales) ? p.nombresRegionales : [],
      erroresComunes: Array.isArray(p?.erroresComunes) ? p.erroresComunes.slice(0, 3) : [],
      cuidados: { ...base.cuidados, ...(p?.cuidados || {}) },
      abono: { ...base.abono, ...(p?.abono || {}) },
      plagas: Array.isArray(p?.plagas) ? p.plagas : [],
      consejosExtra: Array.isArray(p?.consejosExtra) ? p.consejosExtra : [],
    } as FichaPlanta;
  } catch {
    return { ...base, nombreComun: 'No se pudo leer la respuesta', descripcion: textoJSON.slice(0, 300) };
  }
}

// ── 2) Chat botánico multi-turno ────────────────────────────

const SYSTEM_CHAT = `Eres el "Botánico de PlantTrack": un experto en plantas, jardinería, riego, abonos, plagas y enfermedades de TODO el mundo, con dominio especial de flora latinoamericana y sus nombres regionales (ej: en Perú al Capsicum annuum var. glabriusculum se le dice "ají charapita"). Cálido y directo. Respondes en español, conciso (máx. 180 palabras), con pasos concretos.

MODO MAESTRO: además de responder, EXPLICA EL PORQUÉ en 1-2 frases — el usuario quiere aprender, no solo recibir la solución. Ej: "Corta las hojas amarillas: ya no hacen fotosíntesis y consumen energía; la planta las abandona".

NOMBRES REGIONALES: si el usuario menciona una planta por su nombre local, identifícala, menciona su nombre científico y otros nombres regionales la primera vez que aparezca. Si te preguntan por las plantas guardadas del usuario, se te pasará su lista al inicio del mensaje. Usa emojis 🌿💧🧪 con moderación.`;

export async function chatearBotanica(
  pregunta: string,
  historial: MensajeChat[],
  contextoPlantas: string,
): Promise<RespuestaIA> {
  const cfg = leerConfigIA();

  if (!cfg.token.trim()) {
    return {
      ok: false, texto: '', error: 'MODO DEMO',
    };
  }

  // Claude necesita alternancia user/assistant; mandamos las
  // últimas 10 rondas válidas
  const ultimas = historial.slice(-10).filter(m => m.texto.trim());
  const mensajes = ultimas.map(m => ({
    rol: m.rol,
    contenido: [{ type: 'text', text: m.texto }] as any[],
  }));

  const preguntaFinal = contextoPlantas
    ? `${contextoPlantas}\n\nMi pregunta: ${pregunta}`
    : pregunta;
  mensajes.push({ rol: 'user', contenido: [{ type: 'text', text: preguntaFinal }] });

  try {
    const texto = await llamarClaude({
      system: SYSTEM_CHAT,
      mensajes,
      maxTokens: 2500,
    }, cfg);
    return { ok: true, texto };
  } catch (e: any) {
    return { ok: false, texto: '', error: e?.message || 'Error inesperado.' };
  }
}

// ── 3) Verificación de nombre regional ──────────────────────
// El usuario ve la ficha y dice "pero acá lo llamamos ají charapita".
// La IA verifica contra la foto + ficha y devuelve el mapeo completo.

const SYSTEM_REGIONAL = `Eres un botánico experto en nomenclatura regional de plantas, especialmente de Latinoamérica. El usuario te muestra una foto de una planta ya identificada y te dice cómo se llama ESA planta en su región. Tu trabajo: verificar que el nombre regional corresponde a la especie de la foto y devolver el mapeo completo.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto extra):
{
  "coincide": boolean,
  "explicacion": "2-3 frases: confirma o corrige con calidez. Si coincide, cuenta algo interesante del nombre regional. Si NO coincide, explica qué planta es realmente la que menciona el usuario.",
  "nombreCientifico": "nombre científico confirmado",
  "nombreComun": "nombre común más extendido internacionalmente",
  "region": "región confirmada del usuario",
  "nombresRegionales": [{ "region": "país", "nombre": "nombre local" }],
  "ajustesCuidados": "ajustes de cuidados específicos para el clima de esa región (opcional, solo si aporta: estacionalidad, lluvias, altitud)"
}

Reglas:
- coincide=true SOLO si el nombre regional del usuario es un nombre válido para la especie de la foto (sinónimo, variante, idioma local).
- Ejemplo: si el usuario dice "ají charapita" y la foto ES un Capsicum frutescens / annuum var. glabriusculum → coincide=true.
- Si el nombre del usuario corresponde a OTRA especie distinta a la de la foto → coincide=false y explica con claridad, sugiriendo el nombre correcto para su región.
- nombresRegionales: 4-8 entradas incluyendo la del usuario.
- Responde SOLO el JSON.`;

export async function verificarNombreRegional(
  imagenBase64: string,
  mediaType: string,
  nombreLocal: string,
  regionUsuario: string,
  fichaActual: FichaPlanta,
): Promise<RespuestaIA> {
  const cfg = leerConfigIA();

  // Modo demo: aceptamos el nombre sin verificación real (para probar la UI)
  if (!cfg.token.trim()) {
    return {
      ok: true,
      modoDemo: true,
      texto: JSON.stringify({
        coincide: true,
        explicacion: `Anotado: en ${regionUsuario || 'tu región'} le decimos "${nombreLocal}" 🌶️ (modo demo: sin verificación real).`,
        nombreCientifico: fichaActual.nombreCientifico,
        nombreComun: fichaActual.nombreComun,
        region: regionUsuario || '',
        nombresRegionales: [
          ...(fichaActual.nombresRegionales || []),
          { region: regionUsuario || 'Tu región', nombre: nombreLocal },
        ],
        ajustesCuidados: '',
      }),
    };
  }

  try {
    const texto = await llamarClaude({
      system: SYSTEM_REGIONAL,
      mensajes: [{
        rol: 'user',
        contenido: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imagenBase64 } },
          { type: 'text', text: `La foto fue identificada como: ${fichaActual.nombreComun} (${fichaActual.nombreCientifico}), familia ${fichaActual.familia}.\n\nEl usuario dice: "Aquí en ${regionUsuario || 'mi país'} a esta planta le decimos '${nombreLocal}'."\n\nVerifica y devuelve el JSON.` },
        ],
      }],
      maxTokens: 2500,
    }, cfg);
    return { ok: true, texto: limpiarJSON(texto) };
  } catch (e: any) {
    return { ok: false, texto: '', error: e?.message || 'Error verificando el nombre regional.' };
  }
}

/** Parsea la verificación regional con valores por defecto. */
export function parsearVerificacionRegional(textoJSON: string): VerificacionRegional {
  const base: VerificacionRegional = {
    coincide: false,
    explicacion: '',
    nombreCientifico: '',
    nombreComun: '',
    region: '',
    nombresRegionales: [],
    ajustesCuidados: '',
  };
  try {
    const v = JSON.parse(textoJSON);
    return {
      ...base, ...v,
      coincide: !!v?.coincide,
      nombresRegionales: Array.isArray(v?.nombresRegionales) ? v.nombresRegionales : [],
    };
  } catch {
    return { ...base, explicacion: textoJSON.slice(0, 300) };
  }
}

// ── 4) Consejero de Productos (v1.3) ────────────────────────
// El usuario compra un producto (insecticida, abono, fungicida…),
// le toma una foto a la etiqueta y la IA actúa como su jardinero
// de confianza: lee los ingredientes, verifica si conviene para
// SUS plantas y le dice exactamente cuánto y cómo usarlo.

const SYSTEM_PRODUCTO = `Eres un agrónomo y jardinero profesional con 30 años de experiencia, experto en productos fitosanitarios y fertilizantes de uso doméstico disponibles en Latinoamérica y el mundo. El usuario te muestra la foto del envase/etiqueta de un producto que compró para sus plantas y quiere consejo honesto, como se lo daría un jardinero de confianza.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto antes o después) con EXACTAMENTE esta estructura en español:

{
  "esProducto": boolean,
  "nombre": "nombre comercial del producto",
  "marca": "marca o laboratorio",
  "tipo": "categoría: Insecticida, Fungicida, Acaricida, Herbicida, Fertilizante, Regulador de crecimiento, Sustrato, Otro",
  "ingredienteActivo": "principio activo + concentración (ej: Imidacloprid 70%)",
  "paraQueSirve": "2-3 frases: qué plagas/problemas controla o qué aporte da",
  "veredicto": "apto" | "cuidado" | "no_recomendado",
  "dosis": "dosis exacta y práctica para plantas de casa (ej: 0.3 g por litro de agua; 5 ml en 1 L)",
  "frecuencia": "cada cuánto repetir y máximo de aplicaciones",
  "formaAplicacion": "cómo aplicarlo bien: hora del día, donde rociar, no lavar después, etc.",
  "precauciones": ["3-5 medidas de seguridad: guantes, mascotas, abejas, niños, cultivos comestibles, ventana abierta…"],
  "plantasSensibles": ["nombres de las plantas del usuario que podrían dañarse con este producto — SOLO de su lista, si ninguna es sensible deja la lista vacía"],
  "recomendacionJardinero": "3-5 frases en primera persona, cálido y directo, como tu jardinero de confianza: si vale la pena usarlo para lo que el usuario necesita, cuándo NO usarlo, y el truco de oro para que funcione",
  "alternativasCaseras": ["2-3 alternativas orgánicas/caseras para el mismo problema"]
}

Reglas:
- veredicto "apto": producto adecuado y seguro para jardinería doméstica con uso correcto.
- veredicto "cuidado": funciona pero tiene riesgos (toxicidad alta, daña abejas/polen, fitotoxicidad en algunas plantas, residual en comestibles) — explica CUÁLES.
- veredicto "no_recomendado": no sirve para plantas, es de uso agrícola intensivo prohibido en casa, o el ingrediente está vetado. Explica por qué y qué comprar en su lugar.
- dosis: convierte la dosis de la etiqueta a medidas caseras (cucharaditas, tapas del envase, ml por litro). Si la etiqueta no se lee bien, estima la típica para ese tipo de producto y dilo en recomendacionJardinero.
- Si la foto NO muestra un producto de jardinería: esProducto=false, nombre="No es un producto de jardín", paraQueSirve describe qué se ve, y el resto con strings vacías / listas vacías / veredicto "no_recomendado".
- plantasSensibles: revisa UNA POR UNA las plantas del jardín del usuario (se te pasa la lista en el mensaje) y destaca las que este producto suele dañar (ej: insecticidas sistémicos y abejas si tiene floración, azufre y cucurbitáceas, herbicidas y TODO). Si el usuario no tiene plantas guardadas, lista vacía.
- Responde SOLO el JSON.`;

export async function analizarProducto(
  imagenBase64: string, // sin el prefijo data:
  mediaType: string,
  contextoJardin: string, // lista de plantas del usuario (o texto vacío)
  extra?: string, // país u otras pistas
): Promise<RespuestaIA> {
  const cfg = leerConfigIA();

  // Modo demo (sin token): análisis de ejemplo determinístico
  if (!cfg.token.trim()) {
    await new Promise(r => setTimeout(r, 1600)); // simula pensar
    return { ok: true, texto: JSON.stringify(PRODUCTO_DEMO), modoDemo: true };
  }

  try {
    const texto = await llamarClaude({
      system: SYSTEM_PRODUCTO,
      mensajes: [{
        rol: 'user',
        contenido: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imagenBase64 } },
          { type: 'text', text: [
            'Analiza este producto de jardinería y devuelve el JSON completo.',
            contextoJardin.trim() ? `\nPlantas del jardín del usuario (revisa sensibilidad una por una): ${contextoJardin.trim()}` : '\nEl usuario todavía no tiene plantas guardadas en la app.',
            extra?.trim() ? `\nContexto: ${extra.trim()}` : '',
          ].join('') },
        ],
      }],
      maxTokens: 6000,
    }, cfg);
    return { ok: true, texto: limpiarJSON(texto) };
  } catch (e: any) {
    return { ok: false, texto: '', error: e?.message || 'Error inesperado analizando el producto.' };
  }
}

/** Parsea el análisis de producto con validación — nunca crashea. */
export function parsearProducto(textoJSON: string): AnalisisProducto {
  const base: AnalisisProducto = {
    esProducto: false, nombre: '', marca: '', tipo: '',
    ingredienteActivo: '', paraQueSirve: '', veredicto: 'cuidado',
    dosis: '', frecuencia: '', formaAplicacion: '',
    precauciones: [], plantasSensibles: [], recomendacionJardinero: '',
    alternativasCaseras: [], descripcionNoProducto: '',
  };
  try {
    const p = JSON.parse(textoJSON);
    const veredictoValido = ['apto', 'cuidado', 'no_recomendado'].includes(p?.veredicto);
    return {
      ...base, ...p,
      esProducto: !!p?.esProducto,
      veredicto: veredictoValido ? p.veredicto : 'cuidado',
      precauciones: Array.isArray(p?.precauciones) ? p.precauciones.filter((x: unknown) => typeof x === 'string').slice(0, 6) : [],
      plantasSensibles: Array.isArray(p?.plantasSensibles) ? p.plantasSensibles.filter((x: unknown) => typeof x === 'string').slice(0, 10) : [],
      alternativasCaseras: Array.isArray(p?.alternativasCaseras) ? p.alternativasCaseras.filter((x: unknown) => typeof x === 'string').slice(0, 4) : [],
    } as AnalisisProducto;
  } catch {
    return { ...base, nombre: 'No se pudo leer la respuesta', paraQueSirve: textoJSON.slice(0, 300) };
  }
}

// ── 5) Diagnóstico de plagas por foto (v1.4) ───────────────
// El usuario le toma una foto a la planta enferma y la IA
// actúa como fitopatóloga: identifica el problema, su gravedad
// y arma el plan de tratamiento paso a paso.

const SYSTEM_PLAGA = `Eres una fitóloga/agrónoma experta en plagas y enfermedades de plantas con 30 años de experiencia, especializada en jardinería doméstica y huertos urbanos de Latinoamérica y el mundo. El usuario te muestra la foto de una planta que le preocupa y quiere saber qué tiene y cómo salvarla.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto antes o después) con EXACTAMENTE esta estructura en español:

{
  "esPlanta": boolean,
  "problemaDetectado": boolean,
  "plagaProbable": "nombre del problema (plaga, enfermedad, o carencia). Si la planta está sana: 'Sin problemas visibles'",
  "confianza": number entre 0 y 100,
  "sintomasDetectados": ["2-4 señales que ves en la foto, específicas"],
  "gravedad": "leve" | "moderada" | "grave",
  "afectaA": ["nombres de las plantas del jardín del usuario que podrían contagiarse si es contagioso — SOLO de su lista, sino lista vacía"],
  "plan": ["3-6 pasos inmediatos en orden de ejecución, concretos y caseros primero"],
  "productoSugerido": "tipo de producto a comprar si hace falta (ej: 'insecticida sistémico', 'fungicida cúprico') — sin marcas",
  "alternativaCasera": "la solución casera/orgánica completa con medidas",
  "prevencion": "cómo evitar que vuelva a pasar, 1-2 frases",
  "explicacion": "2-3 frases en tono maestro: QUÉ le pasa a la planta y PORQUÉ, para que el usuario aprenda (ej: 'las hojas amarillas de abajo son normales: la planta recicla...')"
}

Reglas:
- Si la foto NO contiene una planta: esPlanta=false, problemaDetectado=false, plagaProbable="", y en explicacion di qué se ve.
- Si la planta se ve SANA: problemaDetectado=false, plagaProbable="Sin problemas visibles", gravedad="leve", plan=[], y en explicacion felicita y señala algún cuidado preventivo según la especie que reconozcas.
- Distingue plagas (bichos) de enfermedades (hongos/virus/bacterias) de problemas ambientales (exceso de agua, quemadura de sol, falta de luz) — el diagnóstico correcto cambia todo el tratamiento.
- Si dudas entre dos diagnósticos, elige el más probable, baja la confianza y menciona la alternativa en explicacion.
- Los pasos del plan deben ser ejecutables HOY con cosas de casa, salvo que el problema realmente requiera producto.
- afectaA: revisa las plantas del usuario (se te pasa la lista) y marca las que podrían contagiarse por cercanía o especie. Si no hay riesgo de contagio, lista vacía.
- Responde SOLO el JSON.`;

export async function diagnosticarPlaga(
  imagenBase64: string, // sin el prefijo data:
  mediaType: string,
  contextoJardin: string, // lista de plantas del usuario (o vacío)
  extra?: string, // país u otras pistas
): Promise<RespuestaIA> {
  const cfg = leerConfigIA();

  // Modo demo (sin token): diagnóstico de ejemplo determinístico
  if (!cfg.token.trim()) {
    await new Promise(r => setTimeout(r, 1600)); // simula pensar
    return { ok: true, texto: JSON.stringify(PLAGA_DEMO), modoDemo: true };
  }

  try {
    const texto = await llamarClaude({
      system: SYSTEM_PLAGA,
      mensajes: [{
        rol: 'user',
        contenido: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imagenBase64 } },
          { type: 'text', text: [
            'Mi planta tiene algo raro. Diagnostic qué tiene y devuelve el JSON completo.',
            contextoJardin.trim() ? `\nPlantas que tengo cerca (revisa riesgo de contagio): ${contextoJardin.trim()}` : '\nNo tengo otras plantas guardadas en la app.',
            extra?.trim() ? `\nContexto: ${extra.trim()}` : '',
          ].join('') },
        ],
      }],
      maxTokens: 5000,
    }, cfg);
    return { ok: true, texto: limpiarJSON(texto) };
  } catch (e: any) {
    return { ok: false, texto: '', error: e?.message || 'Error inesperado diagnosticando la plaga.' };
  }
}

/** Parsea el diagnóstico con validación — nunca crashea. */
export function parsearDiagnostico(textoJSON: string): DiagnosticoPlaga {
  const base: DiagnosticoPlaga = {
    esPlanta: false, problemaDetectado: false, plagaProbable: '', confianza: 0,
    sintomasDetectados: [], gravedad: 'leve', afectaA: [], plan: [],
    productoSugerido: '', alternativaCasera: '', prevencion: '', explicacion: '',
  };
  try {
    const d = JSON.parse(textoJSON);
    const gravedadValida = ['leve', 'moderada', 'grave'].includes(d?.gravedad);
    return {
      ...base, ...d,
      esPlanta: !!d?.esPlanta,
      problemaDetectado: !!d?.problemaDetectado,
      confianza: Math.max(0, Math.min(100, Number(d?.confianza) || 0)),
      gravedad: gravedadValida ? d.gravedad : 'leve',
      sintomasDetectados: Array.isArray(d?.sintomasDetectados) ? d.sintomasDetectados.filter((x: unknown) => typeof x === 'string').slice(0, 5) : [],
      afectaA: Array.isArray(d?.afectaA) ? d.afectaA.filter((x: unknown) => typeof x === 'string').slice(0, 10) : [],
      plan: Array.isArray(d?.plan) ? d.plan.filter((x: unknown) => typeof x === 'string').slice(0, 6) : [],
    } as DiagnosticoPlaga;
  } catch {
    return { ...base, explicacion: textoJSON.slice(0, 300) };
  }
}

// ── 6) Test de conexión (Ajustes) ───────────────────────────

export async function probarConexion(cfg: ConfigIA): Promise<{ ok: boolean; mensaje: string }> {
  if (!cfg.token.trim()) return { ok: false, mensaje: 'Pega tu token primero.' };
  try {
    await llamarClaude({
      system: 'Responde con una sola palabra.',
      mensajes: [{ rol: 'user', contenido: [{ type: 'text', text: 'Di: listo' }] }],
      // 300: con adaptive thinking, 10 tokens se los comía el razonamiento
      // interno y llegaba una respuesta SIN texto (falso "respuesta vacía").
      maxTokens: 300,
    }, cfg);
    return { ok: true, mensaje: '✅ Conexión exitosa — Claude respondió.' };
  } catch (e: any) {
    return { ok: false, mensaje: e?.message || 'No se pudo conectar.' };
  }
}

// Re-export para que las vistas puedan armar fichas demo sueltas
export { FICHAS_DEMO };
