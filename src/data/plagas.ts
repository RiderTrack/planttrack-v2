// ═══════════════════════════════════════════════════════════
// 🦟 PLANTTRACK V2 — data/plagas.ts
// Enciclopedia offline de plagas y enfermedades: síntomas,
// tratamientos (químico + casero) y prevención. Se consulta
// desde la Academia y conecta con el diagnóstico por IA y el
// Consejero de Productos.
// ═══════════════════════════════════════════════════════════

import type { PlagaEnciclopedia } from '../types';

export const PLAGAS: PlagaEnciclopedia[] = [
  // ── PLAGAS (bichos) ──────────────────────────────────────
  {
    id: 'pulgon',
    nombre: 'Pulgón',
    emoji: '🦟',
    tipo: 'plaga',
    gravedad: 2,
    sintomas: [
      'Bichitos verdes, negros o marrones (1-3 mm) apiñados en brotes tiernos y envés de hojas',
      'Hojas nuevas deformadas, curvadas o pegajosas (fumagina)',
      'Hormigas subiendo y bajando por la planta (las crían por su miel)',
    ],
    condiciones: 'Primavera y verano, exceso de nitrógeno (abono nitrogenado) y brotes tiernos abundantes.',
    tratamiento: 'Insecticida sistémico o de contacto (imidacloprid, acetamiprid) o piretrinas. Repetir a los 7 días.',
    tratamientoCasero: 'Rocía agua + jabón potásico (o lavavajillas suave, 1 ml/L) sobre todo el envés, 3 días seguidos. Refuerza con aceite de neem (5 ml/L) al atardecer.',
    prevencion: [
      'Revisa el envés de las hojas nuevas 1 vez por semana',
      'Evita el exceso de abono nitrogenado',
      'Atráelos con flores: las mariquitas y las avispas los cazan solas',
    ],
    plantasFrecuentes: 'Rosas, hortalizas (lechuga, ají, tomate), fresas, cítricos jóvenes y casi cualquier brote tierno.',
  },
  {
    id: 'cochinilla-algodonosa',
    nombre: 'Cochinilla algodonosa',
    emoji: '☁️',
    tipo: 'plaga',
    gravedad: 2,
    sintomas: [
      'Bolsitas o mechones de algodón blanco en axilas de hojas, tallos y raíces',
      'Hojas amarillas que se caen, planta que decae sin razón aparente',
      'Sustancia pegajosa y negrilla (hongo fumagina) sobre las hojas',
    ],
    condiciones: 'Ambiente cálido y seco, aire estancado, plantas estresadas. Ataca todo el año en interiores.',
    tratamiento: 'Aceite de neem o insecticida sistémico. En casos fuertes, imidacloprid al suelo (la planta lo absorbe).',
    tratamientoCasero: 'Pasa un hisopo empapado en alcohol 70° por cada bolsita — mueren al contacto. Luego ducha foliar con agua + jabón. Repite cada 5 días por 3 semanas.',
    prevencion: [
      'Ventila bien los interiores: odian el aire en movimiento',
      'Pon en cuarentena las plantas nuevas 2 semanas',
      'Limpia el polvo de las hojas: ahí esconden sus huevos',
    ],
    plantasFrecuentes: 'Suculentas, orquídeas, potus, cítricos, higos, café y plantas de interior en general.',
  },
  {
    id: 'arana-roja',
    nombre: 'Araña roja',
    emoji: '🕷️',
    tipo: 'plaga',
    gravedad: 2,
    sintomas: [
      'Punteado amarillo o plateado muy fino en el haz de la hoja',
      'Telarañas diminutas en el envés y entre brotes',
      'Con una lupa se ven puntos rojos moviéndose (0,5 mm)',
    ],
    condiciones: 'Calor + aire seco. Explota en veranos calurosos, cerca de radiadores o en ambientes con poca humedad.',
    tratamiento: 'Acaricida específico (abamectina, spiromesifen) rotando principio activo. Los insecticidas comunes NO la matan: es arácnido, no insecto.',
    tratamientoCasero: 'Sube la humedad ambiental: ducha foliar completa 2 veces por semana + plato con agua cerca. Aceite de neem (5 ml/L + jabón) al atardecer cada 4-5 días.',
    prevencion: [
      'Rocía las hojas en verano: el aire seco es su paraíso',
      'Aleja las plantas de radiadores y estufas',
      'Revisa el envés al regar: la detectas temprano',
    ],
    plantasFrecuentes: 'Ficus lira, potus, judías, tomate, fresas, rosas y casi todo en verano seco.',
  },
  {
    id: 'mosca-blanca',
    nombre: 'Mosca blanca',
    emoji: '🦟',
    tipo: 'plaga',
    gravedad: 2,
    sintomas: [
      'Nube de mosquitas blancas que vuelan al tocar la planta',
      'Huevos y ninfas amarillentas pegadas al envés de las hojas',
      'Amarilleamiento, debilitamiento y fumagina (melaza pegajosa)',
    ],
    condiciones: 'Verano, invernaderos y ventanas cálidas. Se reproduce rapidísimo (30 días del huevo a adulto).',
    tratamiento: 'Insecticida sistémico (imidacloprid) o jabón potásico + neem en rotación. Trampas cromáticas amarillas para monitorear.',
    tratamientoCasero: 'Trampa amarilla pegajosa (plástico amarillo pintado con aceite de coche o miel) — las atrae irresistiblemente. Aspiradora suave al amanecer sobre las adultas + jabón potásico al envés cada 3 días.',
    prevencion: [
      'Trampa amarilla instalada desde primavera',
      'No la propagues: herramientas y manos limpias entre plantas',
      'Evita regar en exceso: los brotes acuosos las atraen',
    ],
    plantasFrecuentes: 'Tomate, ají, berenjena, geranio, buganvilla, hibisco y fucsia.',
  },
  {
    id: 'trips',
    nombre: 'Trips',
    emoji: '✨',
    tipo: 'plaga',
    gravedad: 2,
    sintomas: [
      'Hojas con brillo plateado y puntitos negros (sus excrementos)',
      'Flores y pétalos deformes o con bordes secos',
      'Bichitos finos y alargados (1-2 mm) que dan saltitos al tocarlos',
    ],
    condiciones: 'Primavera-verano, clima cálido-seco. Entran por ventanas y flores recién compradas.',
    tratamiento: 'Spinosa (spinosad) o insecticidas específicos para trips. Rotar principios para evitar resistencia.',
    tratamientoCasero: 'Trampas azules (las vuelven locas) + jabón potásico al envés. Aceite de neem interrumpe su ciclo de huevos.',
    prevencion: [
      'Trampa azul junto a las plantas propensas',
      'Retira flores marchitas: ahí ponen huevos',
      'Cuartea las flores de mercado antes de juntarlas con tus plantas',
    ],
    plantasFrecuentes: 'Monstera, rosas, gladiolos, cebolla, ajo, fresas y orquídeas.',
  },
  {
    id: 'minador',
    nombre: 'Minador de hojas',
    emoji: '〰️',
    tipo: 'plaga',
    gravedad: 1,
    sintomas: [
      'Dibujos serpenteantes blancos dentro de la hoja (como mapa)',
      'Puntitos negros de excremento dentro de las galerías',
      'Hojas que se secan y caen prematuramente',
    ],
    condiciones: 'Primavera y otoño templados. La larva vive DENTRO de la hoja, protegida.',
    tratamiento: 'Sistémicos (imidacloprid, spinosad) — los de contacto no llegan adentro de la hoja.',
    tratamientoCasero: 'Pellizca la galería con la uña para aplastar la larva. Retira y destruye hojas muy minadas. Atrapa adultas con trampas amarillas.',
    prevencion: [
      'Revisa hojas nuevas: las galerías empiezan como un puntito',
      'Trampas amarillas para los adultos',
      'No abones en exceso: el follaje tierno las atrae',
    ],
    plantasFrecuentes: 'Cítricos (limonero), tomate, espinaca, acelga, gerbera y crisantemo.',
  },
  {
    id: 'babosas',
    nombre: 'Babosas y caracoles',
    emoji: '🐌',
    tipo: 'plaga',
    gravedad: 2,
    sintomas: [
      'Hojas y lechugas comidas con agujeros irregulares desde los bordes',
      'Rastros de baba plateada en hojas y macetas al amanecer',
      'Plántulas desaparecidas de la noche a la mañana',
    ],
    condiciones: 'Noches húmedas, riego nocturno, macetas sobre suelo húmedo, épocas de lluvia.',
    tratamiento: 'Cebo ferrícol (fosfato de hierro): seguro para mascotas y aves. Aplicar al atardecer alrededor de las macetas.',
    tratamientoCasero: 'Trampa de cerveza: un vasito enterrado a ras de suelo — caen enamoradas de noche. Retira las que encuentres con linterna a las 22h (hora pico). Barrera de café molido o cáscara de huevo alrededor.',
    prevencion: [
      'Riega temprano: el suelo seco de noche las desanima',
      'Levanta macetas del suelo con soportes',
      'Una tabla húmeda cerca: se esconden debajo de día y las cazas',
    ],
    plantasFrecuentes: 'Lechuga, repollo, fresas, hostas, plántulas jóvenes de todo el huerto.',
  },
  {
    id: 'hormigas',
    nombre: 'Hormigas',
    emoji: '🐜',
    tipo: 'plaga',
    gravedad: 1,
    sintomas: [
      'Filas organizadas subiendo por tallos y macetas',
      'Tierra removida o montículos en las macetas',
      'Pulgón o cochinilla apareciendo tras ellas (las pastorean)',
    ],
    condiciones: 'Buscan agua y dulzor (melaza de plagas). Son SÍNTOMA más que plaga.',
    tratamiento: 'Cebo hormiguicida en gel lejos de la huerta. Diatomea (tierra de diatomeas) espolvoreada en su camino.',
    tratamientoCasero: 'Barrera de tiza o canela en polvo alrededor de la maceta — no la cruzan. Café molido y cáscara de cítrico también las desvían.',
    prevencion: [
      'Controla el pulgón: sin melaza, sin hormigas',
      'Macetas sobre platos con agua (foso) en épocas de invasión',
      'Sella las entradas por donde entran a casa',
    ],
    plantasFrecuentes: 'Todas — especialmente huertas en suelo y macetas de terraza.',
  },
  {
    id: 'nematodos',
    nombre: 'Nematodos del nudo',
    emoji: '🪱',
    tipo: 'plaga',
    gravedad: 3,
    sintomas: [
      'Planta que decae sin explicación, amarilleando de abajo hacia arriba',
      'Raíces con abultamientos o nudos irregulares (bolsas de huevos)',
      'Crecimiento pobre incluso con riego y abono correctos',
    ],
    condiciones: 'Suelos cálidos y húmedos, huertas intensivas sin rotación.',
    tratamiento: 'No hay cura para la planta afectada: hay que sacarla y sanear el suelo. Solarización (plástico negro 6 semanas de sol) o biofumigación con tagetes.',
    tratamientoCasero: 'Siembra tagetes (clavelón) y rábanos en el sitio afectado: sus raíces los envenenan. Aporta materia orgánica compostada: sus hongos depredadores los cazan.',
    prevencion: [
      'Rota cultivos: no repitas solanáceas en el mismo sitio',
      'Tagetes bordeando la huerta todo el año',
      'Limpia bien las herramientas entre camas',
    ],
    plantasFrecuentes: 'Tomate, ají, berenjena, lechuga, zanahoria y casi toda huerta en suelo.',
  },
  {
    id: 'gorgojo',
    nombre: 'Gorgojo (picudo)',
    emoji: '🪲',
    tipo: 'plaga',
    gravedad: 2,
    sintomas: [
      'Bordes de hojas comidos en muescas semicirculares',
      'Adultos pardos con trompa que caen al tocar la planta (se hacen los muertos)',
      'Planta que se cae: la larva come raíces por dentro',
    ],
    condiciones: 'Noches frescas, huertas y viveros. Las larvas subterráneas son el problema real.',
    tratamiento: 'Nematodos entomopatógenos (Heterorhabditis) al sustrato: los cazan bajo tierra. Adultos: tratamiento nocturno con piretrinas.',
    tratamientoCasero: 'Sacudir la planta de noche sobre un paño (salen a comer de noche) y eliminarlos. Trampa de tablillas en Y con sacos: se esconden de día.',
    prevencion: [
      'Revisa de noche con linterna una vez por semana',
      'Quita restos de poda y hojas caídas alrededor',
      'Mosquito netting (malla antiinsectos) en viveros',
    ],
    plantasFrecuentes: 'Fresas, ciruelos, olivos, palmeras, begonias y ciclamen.',
  },

  // ── ENFERMEDADES (hongos, virus, bacterias) ─────────────
  {
    id: 'oidio',
    nombre: 'Oídio (polvo blanco)',
    emoji: '🌫️',
    tipo: 'enfermedad',
    gravedad: 2,
    sintomas: [
      'Polvo blanco harinoso sobre hojas, como espolvoreado de harina',
      'Hojas que se amarillean, se retuercen y secan',
      'Empieza en hojas viejas y sombreadas del interior',
    ],
    condiciones: 'Humedad alta de noche + calor seco de día. Poca ventilación y follaje denso.',
    tratamiento: 'Fungicida específico para oídio (azufre mojable, miclobutanil, penconazol). Azufre solo con menos de 30°C.',
    tratamientoCasero: 'Bicarbonato de sodio: 1 cucharadita por litro de agua + 1 ml de jabón (adherente) + media cucharadita de aceite vegetal. Aplica al atardecer cada 5-7 días. También leche diluida al 40% en agua.',
    prevencion: [
      'Ventila y separa plantas: el aire estancado lo invita',
      'Riega la tierra sin mojar el follaje',
      'Retira y desecha hojas infectadas (nunca al compost)',
    ],
    plantasFrecuentes: 'Rosas, zapallo, pepino, vid, caléndulas y phlox.',
  },
  {
    id: 'mildiu',
    nombre: 'Mildiu (manchas grasas)',
    emoji: '🍂',
    tipo: 'enfermedad',
    gravedad: 3,
    sintomas: [
      'Manchas amarillas aceitosas en el haz que se vuelven marrones',
      'Vellosidad gris-blanca en el envés bajo la mancha',
      'Hojas que se marchitan rápido, como quemadas',
    ],
    condiciones: 'Lluvia o rocío + temperaturas 15-22°C. Se propaga por agua salpicada.',
    tratamiento: 'Fungicidas a base de cobre (oxicloruro, caldo bordelés) o metalaxil + cobre. Aplicar al primer síntoma.',
    tratamientoCasero: 'Caldo bordelés casero para prevenir. Retira TODO tejido infectado antes de tratar. Mejora el drenaje y riega a pie de planta.',
    prevencion: [
      'Riega al amanecer para que el follaje seque de día',
      'Mulch (cobertura) en el suelo: sin salpicaduras no hay contagio',
      'Variedades resistentes en zonas propensas',
    ],
    plantasFrecuentes: 'Tomate, papa, vid, lechuga, cebolla y rosas.',
  },
  {
    id: 'roya',
    nombre: 'Roya',
    emoji: '🟠',
    tipo: 'enfermedad',
    gravedad: 2,
    sintomas: [
      'Pústulas polvorientas naranjas, marrones o rojizas en el envés',
      'Manchas amarillas pálidas en el haz, justo enfrente de las pústulas',
      'Deformación y caída prematura de hojas',
    ],
    condiciones: 'Alta humedad + temperaturas suaves (10-25°C). Llega con lluvias primaverales.',
    tratamiento: 'Fungicidas sistémicos (tebuconazol, triadimefón) o azufre. Corta y desecha las hojas afectadas ANTES de aplicar.',
    tratamientoCasero: 'Bicarbonato + aceite de neem frena su avance en fases tempranas. Leche fermentada diluida al 50% rociada al atardecer.',
    prevencion: [
      'No toques plantas mojadas: esparces las esporas',
      'Ventila y solarea bien: la sombra lo favorece',
      'Barre y destruye hojas caídas en otoño',
    ],
    plantasFrecuentes: 'Ajos, cebollas, frijoles, geranios, rosas y menta.',
  },
  {
    id: 'botrytis',
    nombre: 'Botrytis (moho gris)',
    emoji: '🩶',
    tipo: 'enfermedad',
    gravedad: 2,
    sintomas: [
      'Moho gris esponjoso sobre pétalos y hojas viejas',
      'Manchas marrones acuosas que se ablandan (podredumbre blanda)',
      'Aparece primero en flores marchitas y heridas',
    ],
    condiciones: 'Humedad alta + frescor (15-20°C) + tejido muerto o herido. El clásico de invierno en interiores.',
    tratamiento: 'Fungicidas (iprodiona, fluopicolide). Ante todo: higiena — elimina todo tejido afectado ya.',
    tratamientoCasero: 'Retira flores marchitas a diario (su hotel favorito). Baja la humedad: menos rocíos, más ventilación. Bicarbonato como freno suave.',
    prevencion: [
      'Retira flores y hojas marchitas religiosamente',
      'No dejes restos de poda en la maceta',
      'Ventila los interiores aunque haga frío',
    ],
    plantasFrecuentes: 'Ficus lira, rosas, fresas, orquídeas, geranios y ciclamen.',
  },
  {
    id: 'antracnosis',
    nombre: 'Antracnosis (manchas negras)',
    emoji: '⚫',
    tipo: 'enfermedad',
    gravedad: 3,
    sintomas: [
      'Manchas negras o marrón-oscuras hundidas con borde amarillo',
      'Las manchas crecen y se agrietan en el centro',
      'Defoliación severa: la planta va quedando pelada',
    ],
    condiciones: 'Lluvia cálida, riego por aspersión, heridas en hojas y frutos.',
    tratamiento: 'Fungicidas cúpricos o clorotalonil. Podar y quemar ramas afectadas, desinfectando la tijera entre cortes.',
    tratamientoCasero: 'Sin cura casera real: la clave es cirugía (cortar todo lo infectado) + cobre preventivo. Bicarbonato frena levemente el avance.',
    prevencion: [
      'Riego a suelo, jamás por arriba',
      'Tijeras limpias y desinfectadas con alcohol',
      'Fertiliza equilibrado: plantas débiles caen primero',
    ],
    plantasFrecuentes: 'Mango, aguacate, papaya, tomate, fríjol, olivo y rosas.',
  },
  {
    id: 'pudricion-raiz',
    nombre: 'Podredumbre de raíces (Phytophthora)',
    emoji: '🫠',
    tipo: 'enfermedad',
    gravedad: 3,
    sintomas: [
      'Planta que se marchita aunque la tierra esté HÚMEDA',
      'Hojas amarillas que caen empezando por abajo',
      'Tallo blando o negro en la base, raíces marrones y blanduzcas al sacar la planta',
    ],
    condiciones: 'Sobreriego + drenaje pobre. El asesino silencioso #1 de plantas de interior y suculentas.',
    tratamiento: 'Cirugía de emergencia: saca la planta, lava raíces, corta TODO lo blando/negro con tijera esterilizada, sumerge en fungicida y replanta en sustrato nuevo seco. Riega recién tras 5-7 días.',
    tratamientoCasero: 'Mismo procedimiento quirúrgico + canela en polvo sobre los cortes (antifúngico suave). Peróxido de hidrógeno al 3% diluido en el agua de riego posterior (1 parte en 4) oxigena las raíces.',
    prevencion: [
      'Maceta SIEMPRE con agujero de drenaje',
      'Deja secar la capa superior del sustrato entre riegos',
      'Sustrato con perlita o corteza: que respire',
    ],
    plantasFrecuentes: 'Suculentas, orquídeas, potus, cactus, tomates y todo lo que se riega con amor excesivo.',
  },
  {
    id: 'virus-mosaico',
    nombre: 'Virus del mosaico',
    emoji: '🧬',
    tipo: 'enfermedad',
    gravedad: 3,
    sintomas: [
      'Moteado verde claro-oscuro en hojas jóvenes (como mosaico)',
      'Hojas deformes, arrugadas o asimétricas',
      'Crecimiento enano o raquítico, frutos manchados',
    ],
    condiciones: 'Lo transmiten pulgones, trips y herramientas contaminadas. No tiene cura: la planta queda infectada de por vida.',
    tratamiento: 'NO existe tratamiento. La planta infectada debe eliminarse para proteger al resto. No al compost: a la basadora sellada.',
    tratamientoCasero: 'Lo único posible: prevenir vectores (pulgón, trips) y esterilizar herramientas. Si es valiosa, aísla y asume hojas feas sin fruto.',
    prevencion: [
      'Controla pulgones y trips: son los taxistas del virus',
      'Tijeras desinfectadas con alcohol entre plantas',
      'Compra semillas y plantines certificados',
    ],
    plantasFrecuentes: 'Tomate, ají, tabaco ornamental, calabazas y begonias.',
  },
];

/** Busca en la enciclopedia por nombre o síntoma. */
export function buscarPlagas(texto: string, tipo: 'todas' | 'plaga' | 'enfermedad'): PlagaEnciclopedia[] {
  const q = texto.trim().toLowerCase();
  return PLAGAS.filter(p => {
    if (tipo !== 'todas' && p.tipo !== tipo) return false;
    if (!q) return true;
    return p.nombre.toLowerCase().includes(q)
      || p.sintomas.some(s => s.toLowerCase().includes(q))
      || p.plantasFrecuentes.toLowerCase().includes(q)
      || p.condiciones.toLowerCase().includes(q);
  });
}

export const ETIQUETA_GRAVEDAD: Record<number, { texto: string; clase: string }> = {
  1: { texto: 'Molesta', clase: 'bg-emerald-500/15 text-emerald-400' },
  2: { texto: 'Seria', clase: 'bg-amber-500/15 text-amber-400' },
  3: { texto: 'Grave', clase: 'bg-red-500/15 text-red-400' },
};
