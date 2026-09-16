// ═══════════════════════════════════════════════════════════
// 🌿 PLANTTRACK V2 — types.ts
// Contratos de datos compartidos por TODA la app.
// La ficha de planta es el corazón: la produce la IA (Claude)
// al analizar una foto y se guarda tal cual en Mi Jardín.
// ═══════════════════════════════════════════════════════════

/** Pestañas de navegación principal (BottomNav). */
export type NavigationTab =
  | 'inicio'
  | 'identificar'
  | 'jardin'
  | 'chat'
  | 'ajustes';

/** Dificultad de cuidado reportada por la IA. */
export type Dificultad = 'facil' | 'media' | 'dificil';

/** Ficha botánica completa que devuelve Claude al ver una foto. */
export interface FichaPlanta {
  esPlanta: boolean;
  nombreComun: string;
  nombreCientifico: string;
  familia: string;
  confianza: number; // 0-100
  descripcion: string;
  toxicidad: string;
  dificultad: Dificultad;
  cuidados: {
    riego: {
      frecuenciaDias: number; // cada N días (para recordatorios)
      frecuenciaTexto: string; // "Cada 7 días aprox."
      cantidad: string; // "1-2 vasos, hasta escurrir"
      consejos: string[];
    };
    luz: string;
    temperatura: { minima: number; maxima: number; ideal: string };
    humedad: string;
    sustrato: string;
    poda: string;
  };
  abono: {
    tipo: string;
    dosis: string;
    frecuencia: string;
    epoca: string;
    consejos: string[];
  };
  plagas: { nombre: string; sintomas: string; tratamiento: string }[];
  consejosExtra: string[];
}

/** Una planta guardada en Mi Jardín (localStorage). */
export interface PlantaGuardada {
  id: string;
  ficha: FichaPlanta;
  fotoDataUrl: string; // miniatura JPEG para la lista (caché local, no se sincroniza)
  fechaRegistro: string; // ISO
  ultimoRiego: string; // ISO
  proximoRiego: string; // ISO calculado por frecuenciaDias
  /** Sello de última modificación (ISO) — solo lo maneja sync.ts para merge en la nube. */
  _mod?: string;
  notas: string;
  historialRiego: string[]; // ISOs
  modoDemo: boolean; // true si la ficha vino del modo demo
}

/** Mensaje del chat botánico. */
export interface MensajeChat {
  id: string;
  rol: 'user' | 'assistant';
  texto: string;
  fecha: string; // ISO
}

/** Configuración de la IA guardada en Ajustes. */
export interface ConfigIA {
  token: string;
  modelo: string;
}

/** Resultado de una llamada a la IA. */
export interface RespuestaIA {
  ok: boolean;
  texto: string;
  error?: string;
  modoDemo?: boolean;
}

/** Toast flotante global. */
export interface AvisoToast {
  id: string;
  tipo: 'exito' | 'error' | 'info';
  texto: string;
}
