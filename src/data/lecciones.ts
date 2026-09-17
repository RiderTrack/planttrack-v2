// ═══════════════════════════════════════════════════════════
// 🎓 PLANTTRACK V2 — data/lecciones.ts
// Academia PlantTrack: cursos con mini-lecciones de 1 minuto.
// Progreso en services/academia.ts. Contenido 100% offline.
// ═══════════════════════════════════════════════════════════

export interface Leccion {
  id: string;
  titulo: string;
  emoji: string;
  minutos: number; // ~1-2
  resumen: string;
  contenido: string[]; // párrafos cortos y didácticos
  puntosClave: string[]; // 3 takeaways
}

export interface Curso {
  id: string;
  titulo: string;
  emoji: string;
  descripcion: string;
  nivel: 'semilla' | 'brote' | 'jardinero';
  lecciones: Leccion[];
}

export const CURSOS: Curso[] = [
  {
    id: 'fundamentos',
    titulo: 'Fundamentos de planta feliz',
    emoji: '🌱',
    descripcion: 'Lo esencial para que cualquier planta sobreviva a tus primeras 4 semanas juntos.',
    nivel: 'semilla',
    lecciones: [
      {
        id: 'fund-1',
        titulo: 'El dedo no miente: cómo regar de verdad',
        emoji: '💧',
        minutos: 2,
        resumen: 'El riego es donde nacen y mueren la mayoría de los jardines.',
        contenido: [
          'Casi nadie mata plantas por olvidar regarlas: las mata el exceso. Las raíces necesitan aire además de agua, y un sustrato siempre empapado se queda sin oxígeno → las raíces se pudren → la planta se marchita → el instinto dice "más agua" y el círculo de la muerte se cierra.',
          'La técnica del dedo es infalible: entierra el dedo 2 cm en la tierra. Si sientes humedad, NO riegues. Si sale seco y limpio, riega despacio hasta que salga un poco por el drenaje. Ese "hasta que escurra" lava las sales acumuladas del sustrato.',
          'Regla de oro: en duda, espera. Una planta con sed de 2 días se recupera en horas. Una planta ahogada puede tardar semanas… o no volver.',
        ],
        puntosClave: [
          'El 80% de las muertes es por exceso de agua',
          'Dedo 2 cm: húmedo = espera, seco = riega',
          'Riega hasta que escurra por el drenaje',
        ],
      },
      {
        id: 'fund-2',
        titulo: 'Luz: el menú diario de tu planta',
        emoji: '☀️',
        minutos: 2,
        resumen: 'Aprende a leer las ventanas como un botánico.',
        contenido: [
          'Las plantas "comen" luz: la convierten en azúcar mediante la fotosíntesis. Sin suficiente luz, no importa cuánto abono des — la planta pasa hambre porque le falta el ingrediente principal.',
          'Luz directa = sol tocando la hoja varias horas (cactus, suculentas, jazmín). Luz indirecta brillante = cerca de una ventana sin sol directo (potus, filodendro, mayoría de interiores). Sombra = a más de 2-3 m de la ventana (solo sobreviven las valientes como la sansevieria).',
          'Truco de la sombra: a mediodía, pon la mano entre la planta y la ventana. Si tu sombra es nítida y con bordes marcados, es luz directa. Si es difusa, es indirecta. Si casi no hay sombra, ahí no vive casi nada.',
        ],
        puntosClave: [
          'La luz es el alimento #1 — antes que el abono',
          'Sombra nítida = directa; difusa = indirecta',
          'Las hojas oscuras toleran menos luz que las variegadas',
        ],
      },
      {
        id: 'fund-3',
        titulo: 'Macetas y drenaje: la casa importa',
        emoji: '🏺',
        minutos: 1,
        resumen: 'La maceta perfecta no es la más linda, es la que respira.',
        contenido: [
          'Una maceta sin agujero es una pecera disfrazada. El agua acumulada abajo pudre las raíces en días. Si tu maceta favorita no tiene agujero, planta en una de plástico común con drenaje y úsala como portamaceta decorativa.',
          'El tamaño también: una maceta gigante para una planta chica mantiene la tierra húmeda demasiado tiempo. Regla: al trasplantar, sube máximo 3-5 cm de diámetro. La planta llena la maceta con raíces, no al revés.',
        ],
        puntosClave: [
          'Sin drenaje no hay paraíso — siempre agujero',
          'Sube de maceta en pasos de 3-5 cm, no más',
          'El plato con agua estancada = pudrición en camino',
        ],
      },
      {
        id: 'fund-4',
        titulo: 'Lee tus plantas: las 5 señales de socorro',
        emoji: '🚨',
        minutos: 2,
        resumen: 'Tu planta habla con hojas. Aprende su idioma.',
        contenido: [
          'Hojas amarillas de ABAJO: normal, son las viejas retirándose con dignidad. Amarillas ARRIBA o generalizadas + tierra siempre húmeda: exceso de agua, el problema #1.',
          'Puntas marrones y secas: aire muy seco, agua con cloro, o acumulación de sales por exceso de abono. Baja un plato con agua cerca, usa agua reposada y enjuaga el sustrato cada 2 meses.',
          'Hojas pálidas casi blancas con venas verdes: falta de hierro (clorosis). Tallos estirados y "flacos" con hojas pequeñas y separadas: falta de luz. Caída repentina de hojas sanas: cambio brusco de temperatura o corriente de aire frío.',
        ],
        puntosClave: [
          'Amarillas arriba + tierra húmeda = ahogo',
          'Puntas secas = aire seco o cloro',
          'Tallos largos y flacos = pidiendo luz a gritos',
        ],
      },
    ],
  },
  {
    id: 'riego-avanzado',
    titulo: 'Riego de nivel pro',
    emoji: '💧',
    descripcion: 'Del balde al duchazo: técnicas que usan los viveros.',
    nivel: 'brote',
    lecciones: [
      {
        id: 'riego-1',
        titulo: 'Riego por inmersión: el spa de las plantas',
        emoji: '🛁',
        minutos: 1,
        resumen: 'La técnica que hidrata hasta el sustrato más rebelde.',
        contenido: [
          'Cuando la tierra se seca del todo, se contrae y se separa de las paredes de la maceta. Si riegas arriba, el agua se va por los costados sin mojar la raíz: la planta sigue sedienta con agua en el plato.',
          'Solución: sumerge la maceta (hasta 3/4 de su altura) en un balde con agua 10-15 minutos. Verás burbujas salir — es el aire siendo reemplazado por agua en todo el sustrato. Saca, deja escurrir y devuelve a su lugar. Ideal una vez al mes; el resto del tiempo, riego normal.',
        ],
        puntosClave: [
          'Tierra separada de la pared = hidrófoba, no absorbe',
          '10-15 min de inmersión lo arregla',
          'Las burbujas te dicen que está funcionando',
        ],
      },
      {
        id: 'riego-2',
        titulo: 'Agua de calidad: lo que nadie te cuenta',
        emoji: '🚰',
        minutos: 2,
        resumen: 'El cloro, el cal y la temperatura importan más de lo que crees.',
        contenido: [
          'El agua del grifo suele traer cloro (quema las raíces finas y las puntas de las hojas) y a veces cal (sube el pH y bloquea nutrientes). Reposar el agua 24 h en un balde abierto evapora el cloro. Si tu zona tiene agua muy dura, mezcla 50% con agua de lluvia o filtrada.',
          'La temperatura: nunca agua helada sobre raíces calientes de verano ni tibia sobre raíces de invierno. Templada (ambiente) siempre. Y el agua de la AC o deshumidificador: mejor no, trae metales disueltos.',
        ],
        puntosClave: [
          'Reposa el agua 24 h para eliminar el cloro',
          'Agua dura + cal = bloqueo de nutrientes',
          'Templada siempre, nunca de la heladera',
        ],
      },
    ],
  },
  {
    id: 'sustratos',
    titulo: 'Sustratos y trasplantes',
    emoji: '🥣',
    descripcion: 'La receta de la tierra perfecta para cada tipo de planta.',
    nivel: 'brote',
    lecciones: [
      {
        id: 'sustr-1',
        titulo: 'La fórmula universal 60-30-10',
        emoji: '⚗️',
        minutos: 2,
        resumen: 'Una mezcla que funciona para el 90% de plantas de interior.',
        contenido: [
          '60% de base nutritiva (tierra negra o compost tamizado), 30% de drenaje (perlita, arena gruesa o corteza pequeña), 10% de reserva de agua (turba o fibra de coco). Esta proporción guarda agua suficiente pero escurre el exceso.',
          'Ajustes por familia: suculentas y cactus → 40% tierra + 50% arena/perlita + 10% tierra volcánica. Tropicales (filodendros, monstera) → sube la turba/coco a 20%. Orquídeas → viven en corteza pura, no en tierra.',
        ],
        puntosClave: [
          '60-30-10: nutriente-drenaje-reserva',
          'Suculentas piden más arena; tropicales más fibra',
          'Orquídeas: corteza, jamás tierra',
        ],
      },
      {
        id: 'sustr-2',
        titulo: 'Trasplante sin drama (para ti y ella)',
        emoji: '🔄',
        minutos: 2,
        resumen: 'El paso a paso del trasplante que no estresa a la planta.',
        contenido: [
          'Momento ideal: primavera, cuando la planta tiene energía para regenerar raíces. Señales: raíces saliendo por el drenaje, agua que corre directo al plato sin mojar, o planta que se seca en 2 días después de regar.',
          'Paso a paso: riega el día anterior (tierra húmeda se desmolda mejor). Golpea suavemente los costados, saca el cepellón entero apoyándolo en tu mano. NO desfieres las raíces salvo que estén en espiral cerrada (en ese caso, abre suavemente los bordes). Coloca en la nueva maceta con 2 cm nuevos de sustrato abajo y alrededor, sin enterrar el cuello más alto de lo que estaba. Riega y no abones por un mes: las raíces nuevas son sensibles.',
        ],
        puntosClave: [
          'Primavera + riego previo = trasplante feliz',
          'No deshagas el cepellón sin necesidad',
          'Un mes sin abono después del cambio',
        ],
      },
    ],
  },
  {
    id: 'plagas',
    titulo: 'Defensa contra plagas',
    emoji: '🐛',
    descripcion: 'Detecta, identifica y vence a los 6 enemigos clásicos.',
    nivel: 'jardinero',
    lecciones: [
      {
        id: 'plaga-1',
        titulo: 'Los 4 jinetes del apocalipsis vegetal',
        emoji: '🐎',
        minutos: 3,
        resumen: 'Pulgón, cochinilla, araña roja y mosca de sustrato: sus carteles de búsqueda.',
        contenido: [
          'Pulgón: bichitos verdes/negros en brotes tiernos, dejan pegajoso. Ataque masivo en primavera. Jabón potásico o un chorro suave de agua repetido 3 días seguidos.',
          'Cochinilla algodonosa: motas blancas algodonosas en las axilas de las hojas. Se quita con hisopo empapado en alcohol y luego jabón. Es persistente: repite cada 5 días, 3 semanas.',
          'Araña roja: apenas visible, delata su presencia con puntos amarillos y telarañas finísimas en el envés. Aparece con calor y aire seco. Sube la humedad y lava la planta; en casos graves, acaricida.',
          'Mosca del sustrato: mosquitos negros que caminan por la tierra. Sus larvas comen raíces jóvenes. Deja secar la capa superior entre riegos y pon un plato con vinagre de manzana y gotas de jabón cerca.',
        ],
        puntosClave: [
          'Inspección semanal del envés = detección temprana',
          'Araña roja odia la humedad; cochinilla odia el alcohol',
          'Una planta fuerte casi nunca es invadida',
        ],
      },
      {
        id: 'plaga-2',
        titulo: 'Hongos: manchas que cuentan historias',
        emoji: '🍄',
        minutos: 2,
        resumen: 'Aprende a distinguir mancha benigna de ataque fúngico.',
        contenido: [
          'Manchas marrones con anillos concéntricos (como diana) o polvillo blanco harinoso = hongos. La causa casi siempre es la misma: humedad en las hojas + falta de aire. Riega la tierra, no la planta, y separa las macetas amontonadas.',
          'Oidio (polvo blanco): mezcla 1 cucharada de bicarbonato + 1 de aceite vegetal + jabón en 1 L de agua, aplica cada 7 días. Retira y desecha (fuera de casa) las hojas más afectadas — no las compostes.',
        ],
        puntosClave: [
          'Anillos concéntricos = hongo, actúa rápido',
          'Hojas secas + aire circulante = prevención',
          'Nunca compostes hojas enfermas',
        ],
      },
    ],
  },
  {
    id: 'multiplicacion',
    titulo: 'Multiplicación: plantas gratis',
    emoji: '🌿',
    descripcion: 'Esquejes, división y acodos: clona tu jardín sin gastar un centavo.',
    nivel: 'jardinero',
    lecciones: [
      {
        id: 'mult-1',
        titulo: 'Esquejes en agua: magia en 2 semanas',
        emoji: '✂️',
        minutos: 2,
        resumen: 'La forma más satisfactoria de conseguir plantas gratis.',
        contenido: [
          'Elige un tallo sano con al menos 2-3 nudos (los bultitos de donde salen las hojas). Corta 10-15 cm justo DEBAJO de un nudo con tijera limpia — ahí es donde nacen las raíces. Quita las hojas del tramo que irá bajo el agua (se pudrirían).',
          'Ponlo en un vaso con agua reposada, en luz indirecta, y cambia el agua cada 3-4 días. En 2-3 semanas verás raíces blancas. Cuando midan 3-5 cm, pasa a sustrato húmedo y cuida como una planta adulta (recién llegada: delicada las 2 primeras semanas).',
          'Los campeones del agua: potus, filodendro, hiedra, pilea, tradescantia. Los que odian el agua: suculentas (para ellas, hoja o esqueje directo en arena húmeda).',
        ],
        puntosClave: [
          'Corta justo debajo del nudo: ahí nacen raíces',
          'Raíces de 3-5 cm = listo para la tierra',
          'Agua limpia cada 3-4 días, luz indirecta',
        ],
      },
    ],
  },
];

/** Cuenta total de lecciones (para stats). */
export const TOTAL_LECCIONES = CURSOS.reduce((n, c) => n + c.lecciones.length, 0);

export const NIVEL_CURSO: Record<Curso['nivel'], { texto: string; clase: string }> = {
  semilla: { texto: 'Semilla', clase: 'bg-lime-500/15 text-lime-400' },
  brote: { texto: 'Brote', clase: 'bg-emerald-500/15 text-emerald-400' },
  jardinero: { texto: 'Jardinero', clase: 'bg-amber-500/15 text-amber-400' },
};
