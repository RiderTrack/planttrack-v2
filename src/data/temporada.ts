// ═══════════════════════════════════════════════════════════
// 🗓️ PLANTTRACK V2 — data/temporada.ts
// Tips contextuales por temporada para cada planta guardada.
// Heurística local (sin IA): mes + tipo de planta → consejo vivo.
// ═══════════════════════════════════════════════════════════

import type { PlantaGuardada } from '../types';

export type Estacion = 'primavera' | 'verano' | 'otono' | 'invierno';

/** Estación actual (hemisferio sur por defecto — el usuario es de Perú). */
export function estacionDeHoy(): { estacion: Estacion; texto: string; emoji: string } {
  const m = new Date().getMonth(); // 0-11
  if (m <= 1 || m === 11) return { estacion: 'verano', texto: 'Verano', emoji: '🔥' };
  if (m <= 4) return { estacion: 'otono', texto: 'Otoño', emoji: '🍂' };
  if (m <= 8) return { estacion: 'invierno', texto: 'Invierno', emoji: '❄️' };
  return { estacion: 'primavera', texto: 'Primavera', emoji: '🌸' };
}

/** Detecta el "tipo" de planta por su nombre científico/común. */
function tipoDePlanta(p: PlantaGuardada): 'suculenta' | 'tropical' | 'floracion' | 'general' {
  const texto = `${p.ficha.nombreCientifico} ${p.ficha.nombreComun} ${p.ficha.familia}`.toLowerCase();
  if (/cact|succul|echever|aloe|sedum|crassul|haworth|sansev|dracaena|yucca|agave/.test(texto)) return 'suculenta';
  if (/monstera|philodendron|epipremnum|pothos|aracea|maranta|calathea|ficus|fern|helecho|bromel|orchid|orquid/.test(texto)) return 'tropical';
  if (/rosa|geranium|pelargon|petunia|violet|saintpaul|hibiscus|buganvil|bougainvil|flor/.test(texto)) return 'floracion';
  return 'general';
}

/**
 * Consejo de temporada específico para una planta.
 * Devuelve null si no hay nada útil que decir.
 */
export function consejoTemporada(p: PlantaGuardada): string | null {
  const { estacion } = estacionDeHoy();
  const tipo = tipoDePlanta(p);
  const nombre = p.apodo || p.ficha.nombreLocal || p.ficha.nombreComun || 'tu planta';

  const TABLA: Record<Estacion, Record<string, string>> = {
    primavera: {
      suculenta: `${nombre} despierta del invierno: vuelve al riego normal y dale la primera dosis de abono diluido. Es también el mejor momento para trasplantar.`,
      tropical: `Primavera: ${nombre} entra en su temporada de crecimiento. Sube el riego gradualmente y abona cada 15 días. ¡Momento perfecto para esquejes!`,
      floracion: `Época dorada: ${nombre} está lista para florecer. Abona con fórmula alta en fósforo (el número del medio alto) y no cambies su ubicación ahora.`,
      general: `Primavera: ${nombre} arranca su crecimiento anual. Revisa si necesita maceta más grande y retoma el abono después del descanso invernal.`,
    },
    verano: {
      suculenta: `Verano: ${nombre} aguanta calor, pero revisa que no hierva en maceta negra al sol directo. Riega temprano en la mañana, nunca al mediodía.`,
      tropical: `Calor: ${nombre} bebe más de lo normal. Vigila las hojas caídas a la tarde (estrés térmico) y sube la humedad con un plato de agua cerca.`,
      floracion: `Verano: retira las flores marchitas de ${nombre} para que no gaste energía en semillas y siga produciendo brotes nuevos.`,
      general: `Verano: riega ${nombre} más seguido y temprano. Si hay ola de calor, muévela lejos del vidrio de la ventana (que funciona como lupa).`,
    },
    otono: {
      suculenta: `Otoño: reduce el riego de ${nombre} a la mitad — las suculentas ya están guardando agua para el invierno.`,
      tropical: `Otoño: ${nombre} frena su crecimiento. Espacia los riegos y deja el abono para la primavera. Limpia las hojas caídas de la superficie.`,
      floracion: `Otoño: la floración de ${nombre} termina. Corte de limpieza: tallos secos y hojas amarillas fuera, y guarda semillas si quedaron.`,
      general: `Otoño: baja la intensidad de todo para ${nombre}. Menos riego, cero abono, y ubícala donde capte la luz que empieza a faltar.`,
    },
    invierno: {
      suculenta: `Invierno: ${nombre} está casi dormida. Riega SOLO si las hojas se arrugan (a veces 1 vez al mes basta). Cero abono.`,
      tropical: `Invierno: ${nombre} sufre el aire seco de las calefacciones. Aléjala del radiador y de las corrientes frías; riega con moderación.`,
      floracion: `Invierno: ${nombre} descansa. No la molestes con trasplantes ni poda fuerte — solo retira lo claramente seco.`,
      general: `Invierno: ${nombre} baja el ritmo al mínimo. Riega poco (el frío + humedad = raíces tristes) y acércala a la ventana: hay menos luz.`,
    },
  };

  return TABLA[estacion][tipo] || null;
}

/** Días que la planta lleva contigo (contador de supervivencia). */
export function diasContigo(p: PlantaGuardada): number {
  const inicio = p.fechaAdopcion || p.fechaRegistro;
  return Math.max(0, Math.floor((Date.now() - new Date(inicio).getTime()) / 86400000));
}
