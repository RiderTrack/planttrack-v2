// ═══════════════════════════════════════════════════════════
// 🌱 PLANTTRACK V2 — data/siembra.ts
// Calendario de siembra por hemisferio + fases lunares
// (tradición huertera). Todo offline: los meses de siembra son
// orientativos para clima templado-subtropical.
// ═══════════════════════════════════════════════════════════

import type { CultivoSiembra, FaseLunar } from '../types';

// Hemisferio sur: otoño 3-5 · invierno 6-8 · primavera 9-11 · verano 12-2
// Norte = sur + 6 meses (mod 12).
const meses = (...m: number[]): number[] => m;

export const CULTIVOS: CultivoSiembra[] = [
  {
    id: 'tomate', nombre: 'Tomate', emoji: '🍅', familia: 'Solanáceas',
    siembraSur: meses(9, 10, 11), siembraNorte: meses(3, 4, 5),
    profundidad: '0,5 cm (semillero y trasplante a las 6-8 semanas)',
    marco: '50 cm entre plantas · 80 cm entre hileras', diasCosecha: '90-120 días desde trasplante',
    lunar: 'creciente',
    tips: [
      'Entierra el tallo hasta las primeras hojas al trasplantar: echa raíces extra',
      'Sol directo 6+ horas o no habrá sabor',
      'Poda los brotes axilares (chupones) para frutos más grandes',
    ], nivel: 'medio',
  },
  {
    id: 'aji', nombre: 'Ají / Pimiento', emoji: '🌶️', familia: 'Solanáceas',
    siembraSur: meses(9, 10, 11), siembraNorte: meses(3, 4, 5),
    profundidad: '0,5 cm en semillero cálido (25°C germina mejor)',
    marco: '40 cm entre plantas', diasCosecha: '100-140 días (los ajíes picantes tardan más)',
    lunar: 'creciente',
    tips: [
      'Germinan lentos (10-20 días): paciencia y calor',
      'El ají charapita se siembra igual: es un Capsicum silvestre feliz',
      'Un poquito de estrés hídrico en la maduración sube el picante',
    ], nivel: 'medio',
  },
  {
    id: 'lechuga', nombre: 'Lechuga', emoji: '🥬', familia: 'Asteráceas',
    siembraSur: meses(3, 4, 5, 9, 10, 11), siembraNorte: meses(9, 10, 11, 3, 4, 5),
    profundidad: 'Apenas cubierta: 0,5 cm (luz ayuda a germinar)',
    marco: '25 cm entre plantas', diasCosecha: '45-70 días',
    lunar: 'creciente',
    tips: [
      'Semilla fresca: a los 2 años ya no germina bien',
      'Sombrea en pleno verano o se amarga',
      'Cosecha por hojas externas y la planta sigue produciendo',
    ], nivel: 'facil',
  },
  {
    id: 'acelga', nombre: 'Acelga', emoji: '🥗', familia: 'Quenopodiáceas',
    siembraSur: meses(3, 4, 9, 10, 11), siembraNorte: meses(9, 10, 3, 4, 5),
    profundidad: '1-2 cm, directa o semillero',
    marco: '30 cm entre plantas', diasCosecha: '50-60 días, cortando hojas dura meses',
    lunar: 'creciente',
    tips: [
      'La más generosa del huerto: una siembra come toda la temporada',
      'Corta hojas externas de afuera hacia adentro',
      'Aguanta media sombra mejor que la mayoría',
    ], nivel: 'facil',
  },
  {
    id: 'espinaca', nombre: 'Espinaca', emoji: '🍃', familia: 'Quenopodiáceas',
    siembraSur: meses(4, 5, 9, 10), siembraNorte: meses(10, 11, 3, 4),
    profundidad: '1-2 cm, directa (odia el trasplante)',
    marco: '15 cm entre plantas', diasCosecha: '40-50 días',
    lunar: 'menguante',
    tips: [
      'Se espiga con calor: siembra temprano en otoño o tarde en invierno',
      'Rica en hierro solo si crece rápido: suelo rico y riego constante',
      'Cosecha la planta entera antes del tallo floral',
    ], nivel: 'facil',
  },
  {
    id: 'zanahoria', nombre: 'Zanahoria', emoji: '🥕', familia: 'Umbelíferas',
    siembraSur: meses(2, 3, 4, 8, 9, 10, 11), siembraNorte: meses(8, 9, 10, 2, 3, 4, 5),
    profundidad: 'Directa a 1 cm, en suelo MUY suelto y fino',
    marco: '5 cm entre plantas (ralear cuando tengan 2 hojas)', diasCosecha: '70-100 días',
    lunar: 'menguante',
    tips: [
      'La reina del suelo suelto: afloja 30 cm de profundidad',
      'No uses estiércol fresco: se bifurcan y ríen de ti',
      'Riega suave a diario hasta germinar (hasta 3 semanas)',
    ], nivel: 'medio',
  },
  {
    id: 'rabano', nombre: 'Rábano', emoji: '🔴', familia: 'Brasicáceas',
    siembraSur: meses(1, 2, 3, 9, 10, 11, 12), siembraNorte: meses(7, 8, 9, 3, 4, 5, 6),
    profundidad: '1 cm, directa',
    marco: '5 cm entre plantas', diasCosecha: '25-35 días ¡rapidísimo!',
    lunar: 'menguante',
    tips: [
      'El cultivo de los impacientes: listo en un mes',
      'Si sale picante: le faltó agua en las últimas 2 semanas',
      'Perfecto para marcar hileras de zanahoria (brotan antes)',
    ], nivel: 'facil',
  },
  {
    id: 'cebolla', nombre: 'Cebolla', emoji: '🧅', familia: 'Amarilidáceas',
    siembraSur: meses(3, 4, 5, 9), siembraNorte: meses(9, 10, 11, 3),
    profundidad: 'Semillero a 1 cm, trasplante a los 10 cm de alto',
    marco: '10-15 cm entre plantas', diasCosecha: '150-200 días (larga pero sin cuidado)',
    lunar: 'menguante',
    tips: [
      'Forma bulbo con días largos: respeta la época de siembra',
      'Riego regular al inicio, SECO el último mes',
      'Dobla el follaje cuando amarillee y cosecha a los 15 días',
    ], nivel: 'medio',
  },
  {
    id: 'ajo', nombre: 'Ajo', emoji: '🧄', familia: 'Amarilidáceas',
    siembraSur: meses(3, 4, 5), siembraNorte: meses(9, 10, 11),
    profundidad: 'Diente a 3-5 cm, punta hacia arriba',
    marco: '15 cm entre dientes', diasCosecha: '180-240 días',
    lunar: 'menguante',
    tips: [
      'Se siembra del diente: la punta mira al cielo',
      'El ajo es de invierno: frío hace los dientes grandes',
      'Corta el "ajo-porro" (tallo floral) para que engorde la cabeza',
    ], nivel: 'facil',
  },
  {
    id: 'papa', nombre: 'Papa', emoji: '🥔', familia: 'Solanáceas',
    siembraSur: meses(8, 9, 10), siembraNorte: meses(2, 3, 4),
    profundidad: 'Papa-semilla a 10 cm, surcos o bolsa profunda',
    marco: '30 cm entre plantas · 70 cm entre surcos', diasCosecha: '100-150 días',
    lunar: 'menguante',
    tips: [
      'Tapa con tierra nueva los tallos al asomarse (aporque): más papas',
      'Brotes verdes al sol = solanina: guarda en oscuridad',
      'En maceta profunda (40 cm+) también funciona',
    ], nivel: 'medio',
  },
  {
    id: 'maiz', nombre: 'Maíz', emoji: '🌽', familia: 'Poáceas',
    siembraSur: meses(10, 11, 12), siembraNorte: meses(4, 5, 6),
    profundidad: '3-4 cm, directa cuando el suelo supera 15°C',
    marco: '30 cm en bloque (no hileras: se poliniza mejor)', diasCosecha: '90-120 días',
    lunar: 'creciente',
    tips: [
      'Siembra en cuadro de 3x3 mínimo: el viento necesita masa para polinizar',
      'Es bebida y comida: suelo rico y riego generoso',
      'Choclo fresco en 90 días; dejar secar en planta para mote',
    ], nivel: 'medio',
  },
  {
    id: 'frijol', nombre: 'Frijol / Poroto', emoji: '🫘', familia: 'Leguminosas',
    siembraSur: meses(9, 10, 11), siembraNorte: meses(3, 4, 5),
    profundidad: '2-3 cm, directa (odia el trasplante)',
    marco: '10 cm trepador · 20 cm arbustivo', diasCosecha: '60-90 días',
    lunar: 'creciente',
    tips: [
      'No abones con nitrógeno: ellos mismos lo fabrican',
      'Los trepadores piden tutor o cerca: siembran familia',
      'Vainas tiernas en 60 días, granos secos en 100',
    ], nivel: 'facil',
  },
  {
    id: 'pallar', nombre: 'Pallar / Habas', emoji: '🫛', familia: 'Leguminosas',
    siembraSur: meses(3, 4, 5, 8, 9), siembraNorte: meses(9, 10, 11, 2, 3),
    profundidad: '4-5 cm, directa',
    marco: '25 cm entre plantas', diasCosecha: '120-150 días',
    lunar: 'creciente',
    tips: [
      'Las habas aguantan heladas suaves: siembra de otoño ideal',
      'Pellizca la punta a los 60 cm: más vainas',
      'El pallar peruano es TROFEO: 6 meses a la cosecha del gigante',
    ], nivel: 'medio',
  },
  {
    id: 'pepino', nombre: 'Pepino', emoji: '🥒', familia: 'Cucurbitáceas',
    siembraSur: meses(10, 11, 12), siembraNorte: meses(4, 5, 6),
    profundidad: '1-2 cm, directa al llegar el calor',
    marco: '40 cm + tutor para trepar', diasCosecha: '60-70 días',
    lunar: 'creciente',
    tips: [
      'Se muere de frío: espera el calor de verdad',
      'Tutor vertical = pepinos rectos y menos plagas de suelo',
      'Cosecha diario en plena producción o se pasa a gigante amargo',
    ], nivel: 'facil',
  },
  {
    id: 'zapallo', nombre: 'Zapallo / Calabaza', emoji: '🎃', familia: 'Cucurbitáceas',
    siembraSur: meses(10, 11), siembraNorte: meses(4, 5),
    profundidad: '2-3 cm, directa en montículo de compost',
    marco: '1-2 m entre plantas (¡se expande!)', diasCosecha: '100-140 días',
    lunar: 'menguante',
    tips: [
      'Montículo de compost + zapallo = matrimonio perfecto',
      'Deja 2-3 frutos por planta para zapallos gigantes',
      'Cosecha cuando el rabito se seca y suena hueco',
    ], nivel: 'facil',
  },
  {
    id: 'brocoli', nombre: 'Brócoli', emoji: '🥦', familia: 'Brasicáceas',
    siembraSur: meses(2, 3, 8, 9), siembraNorte: meses(8, 9, 2, 3),
    profundidad: 'Semillero y trasplante a los 30 días',
    marco: '40 cm entre plantas', diasCosecha: '90-110 días la cabeza central',
    lunar: 'creciente',
    tips: [
      'Tras la cabeza central salen brotes laterales por semanas',
      'Cosecha antes de que florezcan las floretas amarillas',
      'Le encanta el abono orgánico y el riego parejo',
    ], nivel: 'medio',
  },
  {
    id: 'repollo', nombre: 'Repollo / Col', emoji: '🥬', familia: 'Brasicáceas',
    siembraSur: meses(2, 3, 8, 9, 10), siembraNorte: meses(8, 9, 2, 3, 4),
    profundidad: 'Semillero y trasplante',
    marco: '40 cm entre plantas', diasCosecha: '100-130 días',
    lunar: 'creciente',
    tips: [
      'Aprieta el suelo al trasplantar: cabeza firme',
      'Los repollos de invierno son más dulces (frío = azúcar)',
      'Babosas adoran las coles: trampa de cerveza obligatoria',
    ], nivel: 'medio',
  },
  {
    id: 'culantro', nombre: 'Culantro / Cilantro', emoji: '🌿', familia: 'Umbelíferas',
    siembraSur: meses(3, 4, 9, 10, 11), siembraNorte: meses(9, 10, 3, 4, 5),
    profundidad: '1 cm, directa (raíz profunda odia macetas chicas)',
    marco: '15 cm entre plantas', diasCosecha: '40-55 días hojas · 90 semilla',
    lunar: 'creciente',
    tips: [
      'Se espiga con calor: siembra en fresco para hojas',
      'Machaca apenas la semilla (2 mitades) y germina el doble de rápido',
      'Deja 2 plantas florecer: atraen mariquitas al huerto',
    ], nivel: 'facil',
  },
  {
    id: 'perejil', nombre: 'Perejil', emoji: '🌱', familia: 'Umbelíferas',
    siembraSur: meses(3, 4, 9, 10), siembraNorte: meses(9, 10, 3, 4),
    profundidad: '0,5 cm (necesita oscuridad leve: tapa con papel 5 días)',
    marco: '20 cm entre plantas', diasCosecha: '70-90 días, dura 2 años',
    lunar: 'creciente',
    tips: [
      'El germinador más lento de la despensa: 3-4 semanas',
      'Remoja 24 h en agua tibia antes de sembrar',
      'Es bienal: el segundo año es de semillas',
    ], nivel: 'facil',
  },
  {
    id: 'albahaca', nombre: 'Albahaca', emoji: '🪴', familia: 'Lamiáceas',
    siembraSur: meses(10, 11, 12), siembraNorte: meses(4, 5, 6),
    profundidad: '0,5 cm, necesita calor (20°C+)',
    marco: '25 cm entre plantas', diasCosecha: '60-75 días, cosecha por puntas',
    lunar: 'creciente',
    tips: [
      'Compañera del tomate: juntas se protegen de la mosca blanca',
      'Pellizca las flores SIEMPRE: amarga la hoja al florecer',
      'Una planta da para toda la casa: cocina sin culpa',
    ], nivel: 'facil',
  },
  {
    id: 'menta', nombre: 'Menta', emoji: '🍃', familia: 'Lamiáceas',
    siembraSur: meses(9, 10, 11), siembraNorte: meses(3, 4, 5),
    profundidad: 'Esqueje en agua (¡más fácil que semilla!)',
    marco: 'Maceta exclusiva: ES INVASIVA', diasCosecha: '50-60 días, luego continua',
    lunar: 'creciente',
    tips: [
      'Siembra en maceta o se come el huerto entero',
      'Un tallo en agua echa raíces en 7 días: comparte con vecinos',
      'Corta a mitad de tallo para que se arbuste',
    ], nivel: 'facil',
  },
  {
    id: 'fresa', nombre: 'Fresa / Frutilla', emoji: '🍓', familia: 'Rosáceas',
    siembraSur: meses(3, 4, 9, 10), siembraNorte: meses(9, 10, 3, 4),
    profundidad: 'Plantas hijas (estolones) o semillero',
    marco: '30 cm entre plantas', diasCosecha: '110-130 días la primera',
    lunar: 'creciente',
    tips: [
      'Los estolones (guías) regalan plantas hijas gratis',
      'Mulch de paja = frutos limpios y sin podredumbre',
      'Renueva la plantación cada 3 años',
    ], nivel: 'medio',
  },
];

export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** ¿En qué hemisferio está el país? (para elegir el calendario). */
export function hemisferioDePais(pais: string): 'sur' | 'norte' {
  const surPaises = ['perú', 'bolivia', 'chile', 'argentina', 'paraguay', 'uruguay', 'australia', 'sudáfrica', 'nueva zelanda'];
  return surPaises.includes(pais.trim().toLowerCase()) ? 'sur' : 'norte';
}

/** Cultivos que se siembran en un mes dado (según hemisferio). */
export function cultivosDelMes(mes: number, hemisferio: 'sur' | 'norte'): CultivoSiembra[] {
  return CULTIVOS.filter(c => (hemisferio === 'sur' ? c.siembraSur : c.siembraNorte).includes(mes));
}

// ── Fases lunares (algoritmo clásico del ciclo sinódico) ────
// Referencia: luna nueva del 6-ene-2000 18:14 UTC.

export function faseLunar(fecha: Date = new Date()): FaseLunar {
  const SINODICO = 29.530588853;
  const ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const dias = fecha.getTime() / 86400000 - ref;
  const edad = ((dias % SINODICO) + SINODICO) % SINODICO;
  const iluminacion = (1 - Math.cos((2 * Math.PI * edad) / SINODICO)) / 2;

  if (edad < 1.85) {
    return { nombre: 'Luna nueva', emoji: '🌑', iluminacion,
      consejo: 'Día de descanso y preparación: afloja tierra, compost, planifica. Tradición: no sembrar.' };
  }
  if (edad < 5.54) {
    return { nombre: 'Luna creciente', emoji: '🌒', iluminacion,
      consejo: 'Semilla hojas y frutos: lechuga, albahaca, tomate, ají. La savia sube — brote vigoroso.' };
  }
  if (edad < 9.23) {
    return { nombre: 'Cuarto creciente', emoji: '🌓', iluminacion,
      consejo: 'Óptima para siembra de hoja y trasplantes. También abona: la planta absorbe más.' };
  }
  if (edad < 12.92) {
    return { nombre: 'Luna llena', emoji: '🌕', iluminacion,
      consejo: 'Cosecha hojas y frutos (jugosos por savia alta). Evita podar: sangran más.' };
  }
  if (edad < 16.61) {
    return { nombre: 'Cuarto menguante', emoji: '🌗', iluminacion,
      consejo: 'Sembrar raíces: zanahoria, rábano, ajo, papa. La energía baja hacia la tierra.' };
  }
  if (edad < 20.30) {
    return { nombre: 'Luna menguante', emoji: '🌘', iluminacion,
      consejo: 'Raíces y tubérculos van perfecto. Poda, trasplanta y combate plagas (menos savia = menos apetito de bichos).' };
  }
  if (edad < 23.99) {
    return { nombre: 'Luna menguante final', emoji: '🌘', iluminacion,
      consejo: 'Cosecha raíces y storage: ajo, cebolla, papas. Conservan mejor y duran más.' };
  }
  return { nombre: 'Luna nueva', emoji: '🌑', iluminacion,
    consejo: 'Último suspiro del ciclo: limpia, ordena y prepara la próxima siembra.' };
}

export const NIVEL_CULTIVO: Record<CultivoSiembra['nivel'], { texto: string; clase: string }> = {
  facil: { texto: 'Fácil', clase: 'bg-emerald-500/15 text-emerald-400' },
  medio: { texto: 'Medio', clase: 'bg-amber-500/15 text-amber-400' },
  avanzado: { texto: 'Avanzado', clase: 'bg-red-500/15 text-red-400' },
};
