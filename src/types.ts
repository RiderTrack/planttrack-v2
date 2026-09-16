// ═══════════════════════════════════════════════════════════
// 🌿 PLANTTRACK V2 — types.ts
// Contratos de datos compartidos por TODA la app.
// La ficha de planta es el corazón: la produce la IA (Claude)
// al analizar una foto y se guarda tal cual en Mi Jardín.
//
// v1.2 — MEGA-UPDATE:
//  • Nombres regionales (ají charapita 🌶️ y familia)
//  • Errores comunes por especie
//  • Ficha editable: apodo, adopción, maceta, altura, etiquetas
//  • Fotos con línea de tiempo
//  • Recordatorios personalizados
//  • Gamificación: XP, niveles, logros, racha
//
// v1.3 — CONSEJERO DE PRODUCTOS:
//  • Foto del envase → la IA lee etiqueta e ingredientes
//  • Veredicto, dosis y frecuencia personalizadas
//  • Mi Botiquín + aplicaciones registradas por planta
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

/** Nombre común de la planta en una región/país específico. */
export interface NombreRegional {
  region: string; // "Perú", "México", "Colombia"…
  nombre: string; // "Ají charapita", "Chile de árbol"…
}

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
  /** v1.2: cómo se llama esta planta en distintos países. */
  nombresRegionales?: NombreRegional[];
  /** v1.2: el nombre que usa el usuario en su tierra. */
  nombreLocal?: string;
  /** v1.2: región del usuario confirmada (ej: "Perú"). */
  regionUsuario?: string;
  /** v1.2: los 3 errores que suelen matar esta especie. */
  erroresComunes?: string[];
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

/** Una foto en la línea de tiempo de una planta. */
export interface FotoPlantaGuardada {
  id: string;
  dataUrl: string; // JPEG reducido (caché local, NO se sincroniza)
  fecha: string; // ISO
  nota?: string; // "primer brote 🥹"
}

/** Recordatorio personalizado (riego, abono, trasplante…). */
export type TipoRecordatorio = 'riego' | 'abono' | 'trasplante' | 'poda' | 'revision' | 'otro';

export interface Recordatorio {
  id: string;
  tipo: TipoRecordatorio;
  frecuenciaDias: number;
  ultimo: string; // ISO del último registro
  proximo: string; // ISO calculado
  nota?: string;
}

/** Medición de altura para la gráfica de crecimiento. */
export interface MedicionAltura {
  fecha: string; // ISO
  cm: number;
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

  // ── v1.2: ficha editable ──
  apodo?: string; // "Geraldito"
  fechaAdopcion?: string; // "2024-03-15"
  maceta?: string; // "Barro 20cm con drenaje"
  sustratoUsado?: string; // "Tierra negra + perlita"
  ubicacion?: string; // "Balcón, junto a la ventana"
  alturaCm?: number; // última altura registrada
  historialAltura?: MedicionAltura[];
  etiquetas?: string[]; // ["Interior", "Regalo de mamá"]
  fotos?: FotoPlantaGuardada[]; // línea de tiempo (local)
  recordatorios?: Recordatorio[]; // custom (abono, poda…)
  /** v1.3: productos aplicados (insecticidas, abonos…). */
  aplicaciones?: AplicacionProducto[];
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
  /** v1.2: país/región del usuario para nombres locales. */
  pais?: string;
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

/** ── v1.2: Gamificación ── */

export interface Logro {
  id: string;
  icono: string; // emoji
  titulo: string;
  descripcion: string;
  /** Calcula el progreso 0-1 según el estado actual. */
  progreso: (ctx: ContextoLogros) => number;
}

export interface ContextoLogros {
  plantas: number;
  especies: number;
  riegosTotales: number;
  rachaDias: number;
  leccionesCompletadas: number;
  fotosTotales: number;
  plantasVivas: number; // días de supervivencia acumulados
}

export interface ProgresoJardinero {
  xp: number;
  riegosTotales: number;
  fechasActividad: string[]; // YYYY-MM-DD con al menos 1 cuidado
  leccionesCompletadas: string[]; // ids de lecciones
  logrosDesbloqueados: string[]; // ids de logros
  recordRacha: number;
}

/** Resultado de verificar un nombre regional con la IA. */
export interface VerificacionRegional {
  coincide: boolean;
  explicacion: string; // por qué sí o no
  nombreCientifico: string;
  nombreComun: string;
  region: string;
  nombresRegionales: NombreRegional[];
  ajustesCuidados?: string; // "en tu zona llueve más, riega menos…"
}

/** ── v1.3: Consejero de Productos ── */

/** Veredicto de la IA sobre un producto de jardinería. */
export type VeredictoProducto = 'apto' | 'cuidado' | 'no_recomendado';

/** Análisis que devuelve Claude al ver la foto de un producto. */
export interface AnalisisProducto {
  esProducto: boolean;
  nombre: string; // "Confidor 70 WP"
  marca: string;
  tipo: string; // "Insecticida sistémico", "Fertilizante foliar"…
  ingredienteActivo: string; // "Imidacloprid 70%"
  paraQueSirve: string;
  veredicto: VeredictoProducto;
  dosis: string; // "0.3 g por litro de agua"
  frecuencia: string; // "cada 15 días, máx. 3 aplicaciones"
  formaAplicacion: string; // "aspersión foliar al atardecer…"
  precauciones: string[]; // seguridad (guantes, mascotas, abejas…)
  /** Plantas del jardín del usuario que podrían sufrir con este producto. */
  plantasSensibles: string[];
  /** La recomendación personal, estilo "tu jardinero de confianza". */
  recomendacionJardinero: string;
  /** Alternativas caseras/orgánicas. */
  alternativasCaseras: string[];
  /** Si NO es un producto de jardinería: qué se ve en la foto. */
  descripcionNoProducto?: string;
}

/** Producto guardado en Mi Botiquín. */
export interface ProductoGuardado {
  id: string;
  analisis: AnalisisProducto;
  fotoDataUrl: string; // miniatura del envase (caché local)
  fechaRegistro: string; // ISO
  modoDemo: boolean;
  _mod?: string; // sello para futura sync en la nube
}

/** Aplicación de un producto a una planta (historial). */
export interface AplicacionProducto {
  id: string;
  productoId: string;
  productoNombre: string;
  fecha: string; // ISO
  nota?: string;
}
