// ═══════════════════════════════════════════════════════════
// 🛰️ PLANTTRACK V2 — services/clima.ts
// Clima inteligente: pronóstico gratis con Open-Meteo (sin API
// key) + geolocalización (Capacitor en APK, nativa del navegador
// en web). Traduce el pronóstico a consejos de riego para el
// jardín del usuario. Cachea 3 h en localStorage.
// ═══════════════════════════════════════════════════════════

import type { InfoClima } from '../types';

const LS_CLIMA = 'planttrack.clima';
const CACHE_MS = 3 * 3600 * 1000; // 3 horas

export type ErrorClima = 'permiso' | 'sin-datos' | null;

function leerCache(): InfoClima | null {
  try {
    const crudo = localStorage.getItem(LS_CLIMA);
    if (crudo) {
      const c = JSON.parse(crudo) as InfoClima;
      if (Date.now() - new Date(c.fechaConsulta).getTime() < CACHE_MS) return c;
    }
  } catch { /* ok */ }
  return null;
}

function escribirCache(c: InfoClima): void {
  try { localStorage.setItem(LS_CLIMA, JSON.stringify(c)); } catch { /* lleno */ }
}

/** Pide las coordenadas: plugin nativo (APK) o API del navegador (web). */
async function coordenadas(): Promise<{ lat: number; lon: number } | null> {
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 30 * 60 * 1000,
    });
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch {
    return null;
  }
}

/** WMO weather code → emoji + descripción corta. */
export function describirCodigo(codigo: number): { emoji: string; texto: string } {
  if (codigo === 0) return { emoji: '☀️', texto: 'Cielo despejado' };
  if (codigo === 1) return { emoji: '🌤️', texto: 'Mayormente soleado' };
  if (codigo === 2) return { emoji: '⛅', texto: 'Parcialmente nublado' };
  if (codigo === 3) return { emoji: '☁️', texto: 'Nublado' };
  if (codigo >= 45 && codigo <= 48) return { emoji: '🌫️', texto: 'Neblina' };
  if (codigo >= 51 && codigo <= 67) return { emoji: '🌧️', texto: 'Lluvia' };
  if (codigo >= 71 && codigo <= 77) return { emoji: '🌨️', texto: 'Nieve' };
  if (codigo >= 80 && codigo <= 82) return { emoji: '🌧️', texto: 'Chubascos' };
  if (codigo >= 95) return { emoji: '⛈️', texto: 'Tormenta' };
  return { emoji: '🌡️', texto: 'Variable' };
}

/**
 * Obtiene el pronóstico (con cache de 3 h).
 * - forzar=true ignora el cache (botón reintentar).
 * - Devuelve error: 'permiso' si el usuario negó la ubicación.
 */
export async function obtenerClima(forzar = false): Promise<{ clima: InfoClima | null; error: ErrorClima }> {
  if (!forzar) {
    const cache = leerCache();
    if (cache) return { clima: cache, error: null };
  }

  const coords = await coordenadas();
  if (!coords) return { clima: leerCache(), error: 'permiso' };

  try {
    const url = 'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${coords.lat.toFixed(3)}&longitude=${coords.lon.toFixed(3)}`
      + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum'
      + '&current=temperature_2m,weather_code'
      + '&forecast_days=2&timezone=auto';
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();

    const clima: InfoClima = {
      ok: true,
      tempMax: Math.round(d?.daily?.temperature_2m_max?.[0] ?? 0),
      tempMin: Math.round(d?.daily?.temperature_2m_min?.[0] ?? 0),
      lluviaHoy: Math.round((d?.daily?.precipitation_sum?.[0] ?? 0) * 10) / 10,
      lluviaManana: Math.round((d?.daily?.precipitation_sum?.[1] ?? 0) * 10) / 10,
      codigo: d?.current?.weather_code ?? 2,
      fechaConsulta: new Date().toISOString(),
    };
    escribirCache(clima);
    return { clima, error: null };
  } catch {
    return { clima: leerCache(), error: 'sin-datos' };
  }
}

export interface ConsejoClima {
  emoji: string;
  titulo: string;
  texto: string;
  tono: 'lluvia' | 'calor' | 'frio' | 'normal';
}

/** Traduce el pronóstico a un consejo de riego para HOY. */
export function consejoDeRiego(clima: InfoClima): ConsejoClima | null {
  const lluvia48 = clima.lluviaHoy + clima.lluviaManana;

  if (clima.lluviaHoy >= 5) {
    return {
      emoji: '🌧️',
      titulo: 'Hoy llueve en tu zona',
      texto: `Se esperan ~${clima.lluviaHoy} mm: la naturaleza riega por ti. Pospón el riego de las de exterior — solo revisa las de interior.`,
      tono: 'lluvia',
    };
  }
  if (lluvia48 >= 8) {
    return {
      emoji: '☔',
      titulo: 'Lluvia a la vista',
      texto: `Hoy seco pero mañana podrían caer ~${clima.lluviaManana} mm. Si una planta vence mañana, dale solo medio riego.`,
      tono: 'lluvia',
    };
  }
  if (clima.tempMax >= 30) {
    return {
      emoji: '🔥',
      titulo: 'Día caluroso',
      texto: `Máxima de ${clima.tempMax}°C: las de maceta pequeña y sol directo pueden pedir agua extra. Mete el dedo en la tierra antes de repetir riego.`,
      tono: 'calor',
    };
  }
  if (clima.tempMax <= 12) {
    return {
      emoji: '🧊',
      titulo: 'Día fresquito',
      texto: `Máxima de solo ${clima.tempMax}°C: casi ninguna tendrá sed antes de su fecha. El frío frena la sed de las plantas.`,
      tono: 'frio',
    };
  }
  return {
    emoji: describirCodigo(clima.codigo).emoji,
    titulo: 'Clima normal',
    texto: `Entre ${clima.tempMin}° y ${clima.tempMax}°C, sin lluvia esperada: sigue tu calendario de riego normal. 🌿`,
    tono: 'normal',
  };
}
