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
import type { ConfigIA, FichaPlanta, MensajeChat, RespuestaIA, VerificacionRegional } from '../types';
import { esNativo } from './plataforma';
import { FICHAS_DEMO, elegirFichaDemo } from '../data/demo';

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

// ── 4) Test de conexión (Ajustes) ───────────────────────────

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
