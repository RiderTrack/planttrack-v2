// ═══════════════════════════════════════════════════════════
// 🎭 PLANTTRACK V2 — data/demo.ts
// Fichas de ejemplo para el MODO DEMO (sin token de Claude).
// Patrón RiderTrack: poder probar TODA la interfaz antes de
// configurar credenciales. La ficha se elige por hash de la
// imagen → determinística (la misma foto da la misma planta).
// ═══════════════════════════════════════════════════════════

import type { FichaPlanta } from '../types';

const ficha = (p: Partial<FichaPlanta>): FichaPlanta => ({
  esPlanta: true, nombreComun: '', nombreCientifico: '', familia: '',
  confianza: 88, descripcion: '', toxicidad: 'Sin datos', dificultad: 'facil',
  cuidados: {
    riego: { frecuenciaDias: 7, frecuenciaTexto: 'Cada 7 días', cantidad: 'Moderada', consejos: [] },
    luz: 'Luz indirecta', temperatura: { minima: 15, maxima: 30, ideal: '18-28°C' },
    humedad: 'Media', sustrato: 'Tierra universal con drenaje', poda: 'Primavera',
  },
  abono: { tipo: 'Fertilizante líquido 20-20-20', dosis: '5 ml/L', frecuencia: 'Cada 15 días', epoca: 'Primavera y verano', consejos: [] },
  plagas: [], consejosExtra: [],
  ...p,
});

export const FICHAS_DEMO: FichaPlanta[] = [
  ficha({
    nombreComun: 'Potus (Potos)', nombreCientifico: 'Epipremnum aureum', familia: 'Araceae',
    confianza: 92, dificultad: 'facil',
    descripcion: 'Trepadora de interior famosa por su resistencia y crecimiento rápido. Sus hojas acorazonadas con manchas doradas purifican el aire.',
    toxicidad: 'Tóxica si se ingiere (mascotas y humanos) por oxalatos de calcio.',
    cuidados: {
      riego: { frecuenciaDias: 7, frecuenciaTexto: 'Cada 7 días aprox.', cantidad: '1-2 vasos, hasta que escurra un poco', consejos: ['Deja secar la capa superior entre riegos', 'Aguanta mejor la sequía que el exceso de agua'] },
      luz: 'Luz indirecta brillante; tolera media sombra', temperatura: { minima: 15, maxima: 30, ideal: '18-28°C' },
      humedad: 'Normal de casa (40-60%)', sustrato: 'Sustrato universal con perlita para drenar',
      poda: 'Poda los guías largas en primavera para que se densifique',
    },
    abono: { tipo: 'Fertilizante líquido equilibrado 20-20-20', dosis: '5 ml por litro de agua', frecuencia: 'Cada 15 días', epoca: 'Primavera y verano', consejos: ['En invierno no fertilices: la planta descansa'] },
    plagas: [
      { nombre: 'Araña roja', sintomas: 'Puntos amarillos y telarañas finas en el envés', tratamiento: 'Sube la humedad y aplica jabón potásico' },
      { nombre: 'Pulgón', sintomas: 'Brote tierno deformado y pegajoso', tratamiento: 'Riega con agua+jabón o depredadores naturales' },
    ],
    consejosExtra: ['Los entrenudos se alargan si falta luz — acércala a una ventana', 'Reproduce esquejes en agua: enraízan en 2 semanas'],
  }),
  ficha({
    nombreComun: 'Sansevieria (Lengua de suegra)', nombreCientifico: 'Dracaena trifasciata', familia: 'Asparagaceae',
    confianza: 90, dificultad: 'facil',
    descripcion: 'Suculenta de hojas verticales casi indestructible. Ideal para principiantes y dormitorios: libera oxígeno de noche.',
    toxicidad: 'Ligeramente tóxica si se ingiere.',
    cuidados: {
      riego: { frecuenciaDias: 14, frecuenciaTexto: 'Cada 2-3 semanas', cantidad: 'Poca: medio vaso', consejos: ['El error #1 es sobreregarla', 'En invierno riega una vez al mes'] },
      luz: 'De sol directo a sombra — super adaptable', temperatura: { minima: 10, maxima: 35, ideal: '15-30°C' },
      humedad: 'Seca — no necesita rociadas', sustrato: 'Sustrato para cactus/suculentas',
      poda: 'Solo retira hojas secas o dañadas desde la base',
    },
    abono: { tipo: 'Fertilizante para cactus', dosis: 'La mitad de la dosis del envase', frecuencia: 'Cada 30 días', epoca: 'Solo primavera y verano', consejos: ['Poca cosa: en exceso quema las raíces'] },
    plagas: [{ nombre: 'Cochinilla', sintomas: 'Algodón blanco en axilas de hojas', tratamiento: 'Alcohol con hisopo o aceite de neem' }],
    consejosExtra: ['Maceta pequeña > maceta grande: le gusta ir apretada', 'Riega SOLO cuando el sustrato esté seco hasta el fondo'],
  }),
  ficha({
    nombreComun: 'Monstera deliciosa', nombreCientifico: 'Monstera deliciosa', familia: 'Araceae',
    confianza: 87, dificultad: 'media',
    descripcion: 'La reina de las plantas de interior con sus hojas fenestradas icónicas. Crece vigorosa con buen riego y humedad.',
    toxicidad: 'Tóxica si se ingiere (irritación bucal).',
    cuidados: {
      riego: { frecuenciaDias: 7, frecuenciaTexto: 'Cada 7 días', cantidad: 'Generosa hasta escurrir', consejos: ['Rocía sus hojas 2 veces por semana', 'Limpia las hojas con paño húmedo para que respiren'] },
      luz: 'Mucha luz INDIRECTA — el sol directo quema', temperatura: { minima: 16, maxima: 30, ideal: '20-27°C' },
      humedad: 'Alta (60%+); adora el baño con ventana', sustrato: 'Rico en materia orgánica + perlita',
      poda: 'Recorta guías descontroladas; guía con musgo para que trepe',
    },
    abono: { tipo: 'Fertilizante líquido 20-20-20 o guano', dosis: '5-8 ml por litro', frecuencia: 'Cada 20 días', epoca: 'Marzo a septiembre', consejos: ['Alterna con humus de lombriz: hojas gigantes'] },
    plagas: [
      { nombre: 'Thrips', sintomas: 'Hojas con plateado y puntos negros', tratamiento: 'Trampas azules + spinosad' },
      { nombre: 'Manchas foliares', sintomas: 'Puntos marrones húmedos', tratamiento: 'Mejora ventilación y evita mojar la hoja al regar' },
    ],
    consejosExtra: ['Las hojas nuevas sin cortes = falta luz o es joven', 'Gira la maceta cada 2 semanas para crecimiento parejo'],
  }),
  ficha({
    nombreComun: 'Suculenta (Echeveria)', nombreCientifico: 'Echeveria elegans', familia: 'Crassulaceae',
    confianza: 85, dificultad: 'facil',
    descripcion: 'Rosal de piedra con rosetas carnosas de tonos pastel. Perfecta para sol y riego olvidadizo.',
    toxicidad: 'No tóxica.',
    cuidados: {
      riego: { frecuenciaDias: 10, frecuenciaTexto: 'Cada 10-14 días', cantidad: 'Remoja bien y drena', consejos: ['Riega la tierra, NUNCA encima de la roseta', 'Si las hojas se arrugan: tiene sed'] },
      luz: 'Sol directo 4-6 h/día', temperatura: { minima: 5, maxima: 32, ideal: '15-26°C' },
      humedad: 'Seca', sustrato: 'Arena + tierra de cactus (50/50)',
      poda: 'Retira hojas secas de la base con cuidado',
    },
    abono: { tipo: 'Fertilizante para cactus bajo en nitrógeno', dosis: 'Mitad de dosis', frecuencia: 'Cada 45 días', epoca: 'Primavera-verano', consejos: ['Más vale poco: las suculentas viven pobres'] },
    plagas: [{ nombre: 'Cochinilla harinosa', sintomas: 'Algodón blanco bajo las hojas', tratamiento: 'Neem o alcohol 70° pincelado' }],
    consejosExtra: ['Etiolación (se estira) = falta sol', 'Separa hojas y ponlas sobre tierra: nacen hijitos'],
  }),
  ficha({
    nombreComun: 'Ficus lira', nombreCientifico: 'Ficus lyrata', familia: 'Moraceae',
    confianza: 83, dificultad: 'dificil',
    descripcion: 'Árbol de interior elegante con hojas enormes brillantes. Dramático cuando algo no le gusta — el reto de todo coleccionista.',
    toxicidad: 'Savias irritantes si se ingiere.',
    cuidados: {
      riego: { frecuenciaDias: 8, frecuenciaTexto: 'Cada 8 días', cantidad: '2-3 litros hasta escurrir', consejos: ['ODIA los cambios de lugar — elígela y no la muevas', 'Riega con agua tibia sin cloro'] },
      luz: 'Ventana luminosa este/-sur, luz filtrada', temperatura: { minima: 15, maxima: 29, ideal: '18-24°C' },
      humedad: '50%+: rociador semanal', sustrato: 'Fibra de coco + perlita + corteza',
      poda: 'Punta superior en primavera para ramificar',
    },
    abono: { tipo: 'Fertilizante rico en nitrógeno (para hojas)', dosis: '10 ml/L', frecuencia: 'Cada 3 semanas', epoca: 'Abril a octubre', consejos: ['Con hojas nuevas cada 2 semanas gana tamaño'] },
    plagas: [
      { nombre: 'Araña roja', sintomas: 'Punteado pálido y telarañas', tratamiento: 'Ducha foliar + acaricida biológico' },
      { nombre: 'Botrytis', sintomas: 'Manchas marrones en borde de hoja', tratamiento: 'Corta la hoja, baja humedad ambiental' },
    ],
    consejosExtra: ['Si tira hojas: revisa riego, luz y corrientes de aire', 'Limpia las hojas grandes con cerveza diluida: brillo loco'],
  }),
  ficha({
    nombreComun: 'Orquídea Phalaenopsis', nombreCientifico: 'Phalaenopsis amabilis', familia: 'Orchidaceae',
    confianza: 80, dificultad: 'media',
    descripcion: 'La orquídea mariposa: meses de flores aéreas. Vive en raíces aéreas, no en tierra.',
    toxicidad: 'No tóxica.',
    cuidados: {
      riego: { frecuenciaDias: 9, frecuenciaTexto: 'Cada 9 días aprox.', cantidad: 'Sumergir maceta 10 min y escurrir', consejos: ['Las raíces GRIS = sed; VERDES = bien', 'Nunca dejes agua en la base de las hojas'] },
      luz: 'Luz brillante indirecta (norte/sur filtrado)', temperatura: { minima: 16, maxima: 30, ideal: '20-28°C' },
      humedad: '60-70%: plato con guijarros y agua', sustrato: 'Corteza de pino especial orquídeas',
      poda: 'Tras la floración corta el tallo sobre el 2° nudo vivo',
    },
    abono: { tipo: 'Fertilizante especial orquídeas 20-20-20', dosis: '1 tapa por litro', frecuencia: 'Cada 15 días', epoca: 'Todo el año menos flor pico', consejos: ['"Debilmente semanal": mitad de dosis cada riego'] },
    plagas: [{ nombre: 'Cochinilla algodonosa', sintomas: 'Bolsitas blancas en raíces y axilas', tratamiento: 'Neem + repintado con alcohol' }],
    consejosExtra: ['Un descenso nocturno de 5°C en otoño dispara la floración', 'Maceta transparente = raíces felices (hacen fotosíntesis)'],
  }),
];

/** Elige ficha demo por hash de la imagen (determinístico). */
export function elegirFichaDemo(imagenBase64: string): FichaPlanta {
  let h = 0;
  const paso = Math.max(1, Math.floor(imagenBase64.length / 512));
  for (let i = 0; i < imagenBase64.length; i += paso) {
    h = (h * 31 + imagenBase64.charCodeAt(i)) | 0;
  }
  return FICHAS_DEMO[Math.abs(h) % FICHAS_DEMO.length];
}

// ═══════════════════════════════════════════════════════════
// 🧪 MODO DEMO — análisis de producto de ejemplo (v1.3).
// Caso educativo típico: insecticida sistémico común en
// Latinoamérica que FUNCIONA pero merece precaución.
// ═══════════════════════════════════════════════════════════

import type { AnalisisProducto } from '../types';

export const PRODUCTO_DEMO: AnalisisProducto = {
  esProducto: true,
  nombre: 'Confidor 70 WP',
  marca: 'Bayer',
  tipo: 'Insecticida sistémico',
  ingredienteActivo: 'Imidacloprid 70%',
  paraQueSirve:
    'Controla insectos chupadores: pulgón, mosca blanca, cochinilla y trips. La planta lo absorbe y queda protegida por dentro durante varias semanas, por eso se llama "sistémico". Es el insecticida más vendido de Latinoamérica para plagas de casa.',
  veredicto: 'cuidado',
  dosis: '0.3 g (una pizca pequeña, como 1/8 de cucharadita) por litro de agua. Para 2-3 plantas de maceta te sobra con 1 litro.',
  frecuencia: 'Cada 15 días, máximo 3 aplicaciones seguidas. Luego rota a otro ingrediente para que la plaga no cree resistencia.',
  formaAplicacion:
    'Aspersión foliar al atardecer (evita sol directo que quema hojas mojadas). Roca bien el envés de las hojas, que es donde vive la plaga. No laves ni llueva sobre la planta en 24 h.',
  precauciones: [
    'Guantes y mascarilla al prepararlo; lava las manos después aunque no lo toques directo',
    'MUY tóxico para abejas: nunca lo apliques en plantas en floración o cerca de flores que las atraigan',
    'No lo uses en hortalizas o hierbas que vas a comer en menos de 21 días (carencia)',
    'Aparta a mascotas y niños de la zona hasta que seque',
    'Guarda el sobre cerrado, lejos de comida',
  ],
  plantasSensibles: [],
  recomendacionJardinero:
    'Mira: este producto SÍ mata al pulgón y a la mosca blanca, no te voy a mentir — funciona de maravilla. Pero te voy a hablar claro como tu jardinero: para 2 o 3 plantas de casa casi siempre es matar un mosquito con un cañón. Mi consejo: primero lávale las hojas con agua + jabón potásico (o lavavajillas diluido, 1 ml por litro), repite 3 días seguidos y mira. Si la plaga sigue ahí a la semana, recién saca el Confidor. Y un truco de oro: aplícalo al atardecer y apunta al envés de la hoja — la plaga vive ahí y el sol no quema la hoja mojada. Si alguna planta tuya está en floración, espera a que se pasen las flores: por las abejas.',
  alternativasCaseras: [
    'Jabón potásico: 1 ml de jabón (o lavavajillas suave) por litro de agua, espray cada 3 días',
    'Aceite de neem: 5 ml por litro + 1 ml de jabón como adherente, al atardecer',
    'Control manual: pasa un algodón con alcohol por cochinillas y ducha fuerte para pulgón',
  ],
  descripcionNoProducto: '',
};
