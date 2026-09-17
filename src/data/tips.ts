// ═══════════════════════════════════════════════════════════
// 💡 PLANTTRACK V2 — data/tips.ts
// Tips del día enriquecidos: por categoría y por temporada.
// Rotan por fecha + botón "dame otro tip". Sin IA — instantáneos.
// ═══════════════════════════════════════════════════════════

export interface Tip {
  texto: string;
  categoria: 'riego' | 'luz' | 'sustrato' | 'plagas' | 'abono' | 'general' | 'temporada';
  emoji: string;
}

/** Mes → estación para tips de temporada (hemisferio sur). */
export function estacionActual(): string {
  const m = new Date().getMonth(); // 0-11
  if (m <= 1 || m === 11) return 'verano';
  if (m <= 4) return 'otono';
  if (m <= 8) return 'invierno';
  return 'primavera';
}

export const TIPS: Tip[] = [
  // ── Riego ──
  { texto: 'Mete el dedo 2 cm en la tierra antes de regar: si sale húmedo, espera. El 80% de las plantas muere por exceso, no por falta de agua.', categoria: 'riego', emoji: '💧' },
  { texto: 'Riega temprano en la mañana: la planta absorbe el agua antes del calor del mediodía y las raíces no pasan la noche empapadas.', categoria: 'riego', emoji: '🌅' },
  { texto: 'El agua de lluvia o reposada 24 h es mejor que la del grifo: el cloro se evapora y las raíces lo agradecen.', categoria: 'riego', emoji: '🌧️' },
  { texto: 'Las macetas de barro pierden agua por sus paredes: en verano riega hasta 2 veces más seguido que en plástico.', categoria: 'riego', emoji: '🏺' },
  { texto: 'Si la tierra se separó de las paredes de la maceta, el sustrato está hidrófobo: sumerge la maceta en un balde 10 minutos para rehidratarla.', categoria: 'riego', emoji: '🛁' },
  { texto: 'Riega la tierra, no las hojas. Las hojas mojadas de noche son una invitación para los hongos.', categoria: 'riego', emoji: '🍃' },

  // ── Luz ──
  { texto: 'Gira tus macetas un cuarto de vuelta cada semana: la planta crece parejo y no se inclina hacia la ventana.', categoria: 'luz', emoji: '🔄' },
  { texto: '"Luz indirecta" significa: ves tu sombra en la pared pero no te quema el sol. A menos de 1 m de una ventana clara.', categoria: 'luz', emoji: '🪟' },
  { texto: 'Las hojas pálidas o amarillentas con bordes secos pueden ser quemadura solar: aleja la planta de la ventana en las horas fuertes.', categoria: 'luz', emoji: '☀️' },
  { texto: 'Un plato con agua y guijarros sube la humedad cerca de tus tropicales — sin mojar las raíces.', categoria: 'luz', emoji: '💧' },
  { texto: 'Limpia el polvo de las hojas grandes con un paño húmedo: una hoja sucia capta hasta 30% menos luz.', categoria: 'luz', emoji: '🧽' },

  // ── Sustrato ──
  { texto: 'Las macetas SIN agujero de drenaje son la tumba #1 de las plantas. Si es linda pero no tiene agujero, úsala como portamaceta.', categoria: 'sustrato', emoji: '⚠️' },
  { texto: 'Mezcla casera que casi nunca falla: 60% tierra negra + 30% perlita o arena gruesa + 10% compost. Drena y alimenta.', categoria: 'sustrato', emoji: '🥣' },
  { texto: 'Si el agua se acumula en el plato más de 30 minutos después de regar, vacíalo: las raíces podridas empiezan ahí.', categoria: 'sustrato', emoji: '🚱' },
  { texto: 'El sustrato se agota en 1-2 años: si la planta no crece y la tierra se ve gris o compacta, renuévalo en primavera.', categoria: 'sustrato', emoji: '🌱' },

  // ── Plagas ──
  { texto: 'Revisa el ENVÉS de las hojas (la parte de abajo) cada semana: ahí se esconden arañas rojas y cochinillas.', categoria: 'plagas', emoji: '🔍' },
  { texto: 'Jabón potásico casero: 1 cucharadita de jabón neutro por litro de agua, aplica en las hojas y adiós pulgón.', categoria: 'plagas', emoji: '🧼' },
  { texto: 'Hojas con telarañas finas y puntos amarillos = araña roja. Sube la humedad y lava la planta con agua tibia.', categoria: 'plagas', emoji: '🕷️' },
  { texto: 'Los mosquitos negros que vuelan sobre la tierra se eliminan dejando la capa superior secarse entre riegos.', categoria: 'plagas', emoji: '🦟' },
  { texto: 'Una planta estresada por exceso de agua atrae plagas: los primeros en llegar siempre son los débiles.', categoria: 'plagas', emoji: '🪤' },

  // ── Abono ──
  { texto: 'No fertilices una planta enferma o recién trasplantada: primero que se recupere. Es como correr con fiebre.', categoria: 'abono', emoji: '🚫' },
  { texto: 'Menos es más con el abono: la mitad de la dosis recomendada cada 15 días suele superar la dosis completa mensual.', categoria: 'abono', emoji: '⚖️' },
  { texto: 'Las cascaras de banana maduradas en agua 48 h dan un té de potasio natural para la floración.', categoria: 'abono', emoji: '🍌' },
  { texto: 'Etiqueta tus macetas con la fecha del último abono — la memoria falla y la sobredosis quema raíces.', categoria: 'abono', emoji: '🏷️' },

  // ── General ──
  { texto: 'Junta tus plantas: crean un microclima húmedo entre ellas y se ven más felices (y tú también).', categoria: 'general', emoji: '👯' },
  { texto: 'Las raíces saliendo por el agujero de drenaje piden maceta nueva. La mejor época: primavera.', categoria: 'general', emoji: '🌿' },
  { texto: 'Mejor una planta con un poco de sed que con exceso de agua: la pudrición de raíces no tiene vuelta atrás.', categoria: 'general', emoji: '⚰️' },
  { texto: 'Cuando compras una planta nueva, aísllala 2 semanas de las demás: puede traer pasajeros invisibles.', categoria: 'general', emoji: '🚌' },
  { texto: 'Los cafetos (hojas marrones en las puntas) casi siempre son por agua con cloro o aire muy seco.', categoria: 'general', emoji: '☕' },
  { texto: 'Habla con tus plantas… en serio: al acercarte las revisas más seguido y detectas problemas antes.', categoria: 'general', emoji: '💬' },

  // ── Temporada (hemisferio sur) ──
  { texto: 'VERANO: riega más seguido pero temprano. Las plantas en maceta negra al sol directo pueden cocinar sus raíces.', categoria: 'temporada', emoji: '🔥' },
  { texto: 'OTOÑO: reduce el riego gradualmente. Las plantas entran en modo lento y necesitan menos de todo.', categoria: 'temporada', emoji: '🍂' },
  { texto: 'INVIERNO: casi no riegues (cada 2-3 semanas muchas especies). Y aléjalas de los vidrios helados de la ventana.', categoria: 'temporada', emoji: '❄️' },
  { texto: 'PRIMAVERA: es la época de trasplantar, abonar y reproducir. La planta está con energía y perdona errores.', categoria: 'temporada', emoji: '🌸' },
];

/** Tips relevantes para el mes actual (temporada + generales). */
export function tipsDeTemporada(): Tip[] {
  const estacion = estacionActual();
  const deTemporada = TIPS.filter(t => t.categoria === 'temporada' && t.texto.startsWith(estacion.toUpperCase()));
  return [...deTemporada, ...TIPS.filter(t => t.categoria !== 'temporada')];
}

/** Tip del día determinístico + índice para "dame otro". */
export function tipDelDia(indiceExtra = 0): Tip {
  const lista = tipsDeTemporada();
  const dia = Math.floor(Date.now() / 86400000);
  return lista[(dia + indiceExtra) % lista.length];
}

export const ETIQUETA_CATEGORIA: Record<Tip['categoria'], string> = {
  riego: 'Riego', luz: 'Luz', sustrato: 'Sustrato', plagas: 'Plagas',
  abono: 'Abono', general: 'General', temporada: 'Temporada',
};
