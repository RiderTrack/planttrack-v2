// ═══════════════════════════════════════════════════════════
// 🌱 PLANTTRACK V2 — services/jardin.ts
// CRUD de Mi Jardín sobre localStorage. Firebase queda para la
// v2.1 (sync en la nube) — la interfaz ya está pensada igual.
//
// v1.2 — operaciones nuevas:
//  • actualizarCampos (ficha editable completa)
//  • fotos (timeline), etiquetas, altura, recordatorios
//  • aplicarNombreRegional (mapa de nombres IA)
//  • registrarCuidado (abono/poda/trasplante → recordatorios)
// ═══════════════════════════════════════════════════════════

import type {
  PlantaGuardada, FotoPlantaGuardada, Recordatorio,
  TipoRecordatorio, VerificacionRegional, MedicionAltura,
  AplicacionProducto, ProductoGuardado,
} from '../types';
import { registrarRiegoCompletado, registrarActividad } from './logros';
import { reprogramarNotificaciones } from './notificaciones';
import { exportarBotiquin, importarBotiquin } from './productos';
import { listarEsquejes, importarEsquejes } from './esquejes';
import { leerVacaciones } from './vacaciones';

const LS_JARDIN = 'planttrack.jardin';
const LS_NOTAS = 'planttrack.notas'; // id -> notas libres

function leerTodo(): PlantaGuardada[] {
  try {
    const crudo = localStorage.getItem(LS_JARDIN);
    if (crudo) return JSON.parse(crudo) as PlantaGuardada[];
  } catch { /* corrupto → jardín vacío */ }
  return [];
}

function escribirTodo(plantas: PlantaGuardada[]): void {
  localStorage.setItem(LS_JARDIN, JSON.stringify(plantas));
  // reprogramar recordatorios del sistema con el jardín fresco
  void reprogramarNotificaciones(plantas);
}

function mapear(id: string, fn: (p: PlantaGuardada) => PlantaGuardada): PlantaGuardada | undefined {
  const todas = leerTodo();
  const p = todas.find(x => x.id === id);
  if (!p) return undefined;
  const idx = todas.indexOf(p);
  todas[idx] = fn(p);
  escribirTodo(todas);
  return todas[idx];
}

export function listarPlantas(): PlantaGuardada[] {
  return leerTodo().sort((a, b) => a.fechaRegistro < b.fechaRegistro ? 1 : -1);
}

export function obtenerPlanta(id: string): PlantaGuardada | undefined {
  return leerTodo().find(p => p.id === id);
}

export function guardarPlanta(planta: PlantaGuardada): void {
  const todas = leerTodo().filter(p => p.id !== planta.id);
  todas.push(planta);
  escribirTodo(todas);
}

export function eliminarPlanta(id: string): void {
  escribirTodo(leerTodo().filter(p => p.id !== id));
}

/** Registra un riego HOY y recalcula el próximo. */
export function registrarRiego(id: string): PlantaGuardada | undefined {
  const r = mapear(id, p => {
    const ahora = new Date().toISOString();
    p.ultimoRiego = ahora;
    p.historialRiego = [...(p.historialRiego || []), ahora].slice(-60);
    p.proximoRiego = new Date(Date.now() + (p.ficha.cuidados.riego.frecuenciaDias || 7) * 86400000).toISOString();
    return p;
  });
  if (r) registrarRiegoCompletado();
  return r;
}

/** Ajusta la frecuencia de riego desde la ficha de detalle. */
export function ajustarFrecuencia(id: string, dias: number): PlantaGuardada | undefined {
  return mapear(id, p => {
    p.ficha.cuidados.riego.frecuenciaDias = Math.max(1, Math.min(90, dias));
    p.proximoRiego = new Date(new Date(p.ultimoRiego).getTime() + p.ficha.cuidados.riego.frecuenciaDias * 86400000).toISOString();
    return p;
  });
}

// ── v1.2: Ficha editable ─────────────────────────────────────

export interface CamposEditables {
  apodo?: string;
  fechaAdopcion?: string;
  maceta?: string;
  sustratoUsado?: string;
  ubicacion?: string;
  notas?: string;
  nombreComun?: string;
  nombreCientifico?: string;
  luzFavorita?: string;
}

export function actualizarCampos(id: string, campos: CamposEditables): PlantaGuardada | undefined {
  return mapear(id, p => {
    if (campos.apodo !== undefined) p.apodo = campos.apodo.trim() || undefined;
    if (campos.fechaAdopcion !== undefined) p.fechaAdopcion = campos.fechaAdopcion || undefined;
    if (campos.maceta !== undefined) p.maceta = campos.maceta || undefined;
    if (campos.sustratoUsado !== undefined) p.sustratoUsado = campos.sustratoUsado || undefined;
    if (campos.ubicacion !== undefined) p.ubicacion = campos.ubicacion || undefined;
    if (campos.notas !== undefined) p.notas = campos.notas;
    if (campos.nombreComun !== undefined && campos.nombreComun.trim()) p.ficha.nombreComun = campos.nombreComun.trim();
    if (campos.nombreCientifico !== undefined && campos.nombreCientifico.trim()) p.ficha.nombreCientifico = campos.nombreCientifico.trim();
    if (campos.luzFavorita !== undefined && campos.luzFavorita.trim()) p.ficha.cuidados.luz = campos.luzFavorita.trim();
    return p;
  });
}

// ── v1.2: Nombres regionales ─────────────────────────────────

/** Aplica la verificación regional de la IA a la ficha guardada. */
export function aplicarNombreRegional(id: string, verif: VerificacionRegional): PlantaGuardada | undefined {
  return mapear(id, p => {
    if (verif.coincide) {
      p.ficha.nombreLocal = verif.nombresRegionales.find(n => n.region === verif.region)?.nombre
        || verif.nombresRegionales[0]?.nombre || p.ficha.nombreLocal;
      p.ficha.regionUsuario = verif.region;
    }
    p.ficha.nombresRegionales = verif.nombresRegionales.length > 0 ? verif.nombresRegionales : (p.ficha.nombresRegionales || []);
    if (verif.nombreCientifico && verif.coincide) p.ficha.nombreCientifico = verif.nombreCientifico;
    return p;
  });
}

/** Aplica la verificación regional a una ficha SIN guardar (Identificar). */
export function aplicarRegionalAFicha(ficha: import('../types').FichaPlanta, verif: VerificacionRegional): import('../types').FichaPlanta {
  const f = { ...ficha };
  if (verif.coincide) {
    f.nombreLocal = verif.nombresRegionales.find(n => n.region === verif.region)?.nombre
      || verif.nombresRegionales[0]?.nombre;
    f.regionUsuario = verif.region;
    if (verif.nombreCientifico) f.nombreCientifico = verif.nombreCientifico;
    // el nombre local pasa a ser el principal en la UI
    if (f.nombreLocal) f.nombreComun = f.nombreLocal;
  }
  f.nombresRegionales = verif.nombresRegionales.length > 0 ? verif.nombresRegionales : (f.nombresRegionales || []);
  return f;
}

// ── v1.2: Fotos (línea de tiempo) ────────────────────────────

export function agregarFoto(id: string, dataUrl: string, nota?: string): PlantaGuardada | undefined {
  const foto: FotoPlantaGuardada = {
    id: crypto.randomUUID(),
    dataUrl,
    fecha: new Date().toISOString(),
    nota: nota?.trim() || undefined,
  };
  const r = mapear(id, p => {
    p.fotos = [...(p.fotos || []), foto].slice(-30); // máx 30 por planta
    // la última foto se convierte en la portada de la tarjeta
    p.fotoDataUrl = dataUrl;
    return p;
  });
  if (r) registrarActividad(5);
  return r;
}

export function eliminarFoto(id: string, fotoId: string): PlantaGuardada | undefined {
  return mapear(id, p => {
    p.fotos = (p.fotos || []).filter(f => f.id !== fotoId);
    if (p.fotos.length > 0) p.fotoDataUrl = p.fotos[p.fotos.length - 1].dataUrl;
    return p;
  });
}

// ── v1.2: Etiquetas ──────────────────────────────────────────

export function alternarEtiqueta(id: string, etiqueta: string): PlantaGuardada | undefined {
  return mapear(id, p => {
    const et = etiqueta.trim();
    if (!et) return p;
    const actuales = p.etiquetas || [];
    p.etiquetas = actuales.includes(et)
      ? actuales.filter(e => e !== et)
      : [...actuales, et].slice(0, 8);
    return p;
  });
}

/** Todas las etiquetas usadas en el jardín (para el filtro). */
export function etiquetasDelJardin(): string[] {
  const set = new Set<string>();
  for (const p of leerTodo()) (p.etiquetas || []).forEach(e => set.add(e));
  return [...set].sort();
}

// ── v1.2: Altura / crecimiento ───────────────────────────────

export function registrarAltura(id: string, cm: number): PlantaGuardada | undefined {
  const altura = Math.max(0, Math.min(2000, Math.round(cm)));
  const medicion: MedicionAltura = { fecha: new Date().toISOString(), cm: altura };
  return mapear(id, p => {
    p.alturaCm = altura;
    p.historialAltura = [...(p.historialAltura || []), medicion].slice(-50);
    return p;
  });
}

// ── v1.2: Recordatorios custom (abono, poda, trasplante…) ────

const ETIQUETA_TIPO: Record<TipoRecordatorio, string> = {
  riego: 'Riego', abono: 'Abono', trasplante: 'Trasplante',
  poda: 'Poda', revision: 'Revisión', otro: 'Otro',
};

export function agregarRecordatorio(
  id: string, tipo: TipoRecordatorio, frecuenciaDias: number, nota?: string,
): PlantaGuardada | undefined {
  const ahora = new Date().toISOString();
  const rec: Recordatorio = {
    id: crypto.randomUUID(),
    tipo,
    frecuenciaDias: Math.max(1, Math.min(365, frecuenciaDias)),
    ultimo: ahora,
    proximo: new Date(Date.now() + frecuenciaDias * 86400000).toISOString(),
    nota: nota?.trim() || undefined,
  };
  return mapear(id, p => {
    p.recordatorios = [...(p.recordatorios || []), rec].slice(0, 10);
    return p;
  });
}

/** Marca un recordatorio como hecho hoy → recalcula el próximo. */
export function completarRecordatorio(id: string, recId: string): PlantaGuardada | undefined {
  const r = mapear(id, p => {
    p.recordatorios = (p.recordatorios || []).map(rec =>
      rec.id === recId
        ? { ...rec, ultimo: new Date().toISOString(), proximo: new Date(Date.now() + rec.frecuenciaDias * 86400000).toISOString() }
        : rec,
    );
    return p;
  });
  if (r) registrarActividad(8);
  return r;
}

export function eliminarRecordatorio(id: string, recId: string): PlantaGuardada | undefined {
  return mapear(id, p => {
    p.recordatorios = (p.recordatorios || []).filter(rec => rec.id !== recId);
    return p;
  });
}

// ── v1.3: Aplicación de productos (Consejero) ──────────────

/** Registra que HOY se aplicó un producto a la planta (historial). */
export function aplicarProductoAPlanta(
  id: string, producto: ProductoGuardado, nota?: string,
): PlantaGuardada | undefined {
  const aplicacion: AplicacionProducto = {
    id: crypto.randomUUID(),
    productoId: producto.id,
    productoNombre: producto.analisis.nombre || 'Producto',
    fecha: new Date().toISOString(),
    nota: nota?.trim() || undefined,
  };
  const r = mapear(id, p => {
    p.aplicaciones = [...(p.aplicaciones || []), aplicacion].slice(-40);
    return p;
  });
  if (r) registrarActividad(8); // 🏆 XP por tratar a tus plantas
  return r;
}

export { ETIQUETA_TIPO };

// ── Notas (clásicas) ─────────────────────────────────────────

export function guardarNotas(id: string, notas: string): void {
  const m: Record<string, string> = {};
  try { Object.assign(m, JSON.parse(localStorage.getItem(LS_NOTAS) || '{}')); } catch { /* ok */ }
  m[id] = notas;
  localStorage.setItem(LS_NOTAS, JSON.stringify(m));
}

export function leerNotas(id: string): string {
  try {
    const m = JSON.parse(localStorage.getItem(LS_NOTAS) || '{}');
    return m[id] || '';
  } catch { return ''; }
}

/** Exporta todo el jardín + botiquín + esquejes para respaldo (Ajustes). */
export function exportarJardin(): string {
  return JSON.stringify({
    version: 4,
    fecha: new Date().toISOString(),
    plantas: leerTodo(),
    productos: exportarBotiquin(),
    esquejes: listarEsquejes(),
    vacaciones: leerVacaciones(),
    notas: JSON.parse(localStorage.getItem(LS_NOTAS) || '{}'),
    progreso: localStorage.getItem('planttrack.progreso') || null,
  }, null, 2);
}

/** Importa un respaldo (merge por id). */
export function importarJardin(json: string): { ok: boolean; mensaje: string } {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data?.plantas)) return { ok: false, mensaje: 'El archivo no tiene el formato de PlantTrack.' };
    const actuales = leerTodo();
    const ids = new Set(actuales.map(p => p.id));
    const nuevas = data.plantas.filter((p: any) => p?.id && p?.ficha && !ids.has(p.id));
    escribirTodo([...actuales, ...nuevas]);
    if (data.notas && typeof data.notas === 'object') {
      const m: Record<string, string> = {};
      try { Object.assign(m, JSON.parse(localStorage.getItem(LS_NOTAS) || '{}')); } catch { /* ok */ }
      Object.assign(m, data.notas);
      localStorage.setItem(LS_NOTAS, JSON.stringify(m));
    }
    if (data.progreso) {
      try { localStorage.setItem('planttrack.progreso', data.progreso); } catch { /* ok */ }
    }
    const productosNuevos = Array.isArray(data?.productos) ? importarBotiquin(data.productos) : 0;
    const esquejesNuevos = Array.isArray(data?.esquejes) ? importarEsquejes(data.esquejes) : 0;
    if (data?.vacaciones?.activa) {
      try { localStorage.setItem('planttrack.vacaciones', JSON.stringify(data.vacaciones)); } catch { /* ok */ }
    }
    const msg = `Importadas ${nuevas.length} plantas nuevas.`
      + (productosNuevos > 0 ? ` Botiquín: +${productosNuevos} productos.` : '')
      + (esquejesNuevos > 0 ? ` Esquejes: +${esquejesNuevos}.` : '');
    return { ok: true, mensaje: msg };
  } catch {
    return { ok: false, mensaje: 'JSON inválido — no se pudo importar.' };
  }
}
