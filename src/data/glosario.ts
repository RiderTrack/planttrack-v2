// ═══════════════════════════════════════════════════════════
// 📖 PLANTTRACK V2 — data/glosario.ts
// Glosario botánico en lenguaje humano. Consultable offline.
// ═══════════════════════════════════════════════════════════

export interface Termino {
  termino: string;
  definicion: string;
  emoji: string;
}

export const GLOSARIO: Termino[] = [
  { termino: 'Acodo', definicion: 'Técnica de multiplicación donde se enraíza una rama SIN cortarla de la madre, y recién se separa cuando tiene raíces propias.', emoji: '🌿' },
  { termino: 'Bienal', definicion: 'Planta que vive 2 años: el primero crece hojas, el segundo florece, da semilla y muere.', emoji: '📅' },
  { termino: 'Bractea', definicion: 'Hoja modificada que parece pétalo (la parte roja de la flor de Pascua o la rosa de la Buganvilia son brácteas, no pétalos).', emoji: '🌺' },
  { termino: 'Cepellón', definicion: 'El bloque de tierra con raíces que sale entero al sacar una planta de su maceta. Si está "roto" la planta sufre.', emoji: '🥮' },
  { termino: 'Clorosis', definicion: 'Amarilleo por falta de clorofila, suele deberse a falta de hierro o nitrógeno. Hojas pálidas con venas verdes.', emoji: '💛' },
  { termino: 'Cultivar', definicion: 'Variety "de diseño" de una especie, creada por humanos: la Monstera variegada es un cultivar de la Monstera común.', emoji: '🧬' },
  { termino: 'Drenaje', definicion: 'Capacidad del sustrato/maceta de dejar escapar el exceso de agua. Sin drenaje no hay planta sana a largo plazo.', emoji: '🕳️' },
  { termino: 'Envés', definicion: 'La cara de ABAJO de la hoja. Donde se esconden las plagas y donde se miran algunos diagnósticos.', emoji: '🔄' },
  { termino: 'Epifita', definicion: 'Planta que vive sobre otra (árboles) sin parasitarla: orquídeas, bromelias, tilandsias. Sus raíces respiran aire, no van en tierra.', emoji: '🌳' },
  { termino: 'Esqueje', definicion: 'Pedazo de tallo u hoja que se corta para producir una planta nueva idéntica a la madre.', emoji: '✂️' },
  { termino: 'Estoma', definicion: 'Poros microscópicos de las hojas que respiran y transpiran. Se cierran con calor extremo para no perder agua.', emoji: '💨' },
  { termino: 'Fotosíntesis', definicion: 'El proceso de convertir luz + agua + CO2 en azúcar. Es literalmente "cocinar con luz solar".', emoji: '☀️' },
  { termino: 'Hidrófobo', definicion: 'Sustrato tan seco que repele el agua. Se arregla con riego por inmersión 10-15 minutos.', emoji: '🚱' },
  { termino: 'Leguminosa', definicion: 'Familia de plantas que fabrican su propio nitrógeno con bacterias en sus raíces (porotos, arvejas, alfalfa). Abono vivo.', emoji: '🫘' },
  { termino: 'Macronutrientes', definicion: 'N-P-K: Nitrógeno (hojas verdes), Fósforo (raíces y flores), Potasio (frutos y defensas). Los 3 números de las cajas de fertilizante.', emoji: '🔢' },
  { termino: 'Nudo', definicion: 'Bultito del tallo de donde nacen hojas o raíces. Al hacer esquejes, cortar justo debajo de un nudo.', emoji: '🔘' },
  { termino: 'Perenne', definicion: 'Planta que vive varios años y no muere tras florear. Lo contrario de anual.', emoji: '♾️' },
  { termino: 'Perlita', definicion: 'Esferitas blancas livianas de vidrio volcánico expandido. Añaden aire y drenaje al sustrato sin aportar nutrientes.', emoji: '⚪' },
  { termino: 'pH del sustrato', definicion: 'Medida de acidez (0-14). La mayoría de plantas felices viven entre 6 y 7. El agua muy cal lo sube y bloquea nutrientes.', emoji: '⚖️' },
  { termino: 'Plaga', definicion: 'Organismo que se alimenta de tu planta contra su voluntad: pulgón, cochinilla, ácaros, orugas…', emoji: '🐛' },
  { termino: 'Podredumbre radicular', definicion: 'Muerte de raíces por exceso de agua y falta de oxígeno. Síntomas parecidos a sequía porque las raíces muertas no absorben. Casi siempre terminal si llega tarde.', emoji: '💀' },
  { termino: 'Roseta', definicion: 'Hojas que crecen en círculo desde el centro, apretadas como pétalos (suculentas, sansevieria, vueltas a la base).', emoji: '🌹' },
  { termino: 'Suculenta', definicion: 'Planta con reservas de agua en hojas o tallos gruesos para sobrevivir sequías: cactus, echeverias, aloes.', emoji: '🌵' },
  { termino: 'Sustrato', definicion: 'La "tierra" donde vive la planta — pero mejor pensarlo como su comida + su casa + su bebida, todo en uno.', emoji: '🥣' },
  { termino: 'Transpiración', definicion: 'Evaporación de agua por las hojas. Es la bomba que mueve el agua desde la raíz. Con calor extremo, la planta la cierra y "suda" menos.', emoji: '💧' },
  { termino: 'Variegada', definicion: 'Hoja con zonas blancas, crema o amarillas por falta de clorofila en esas partes. Más linda pero más lenta: tiene menos superficie verde para hacer fotosíntesis.', emoji: '🎨' },
  { termino: 'Xilema', definicion: 'Los "tubos" internos que suben el agua de la raíz a las hojas, como cañerías verticales.', emoji: '🚰' },
];
