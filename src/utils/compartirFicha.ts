// ═══════════════════════════════════════════════════════════
// 🖼️ PLANTTRACK V2 — utils/compartirFicha.ts
// Convierte la ficha de una planta en una TARJETA IMAGEN
// (canvas → PNG 1080×1350) lista para compartir por WhatsApp
// o descargar. En APK: @capacitor/filesystem (caché) +
// @capacitor/share. En web: descarga directa.
// ═══════════════════════════════════════════════════════════

import type { PlantaGuardada } from '../types';
import { diasContigo } from '../data/temporada';
import { esNativo } from '../services/plataforma';

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = () => rechazar(new Error('no-image'));
    img.src = src;
  });
}

/** Dibuja la tarjeta de la planta en un canvas y devuelve el PNG (base64 sin prefijo). */
export async function generarTarjetaPlanta(p: PlantaGuardada): Promise<string> {
  const W = 1080, H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const f = p.ficha;
  const nombre = p.apodo || f.nombreLocal || f.nombreComun || 'Mi planta';
  const cientifico = f.nombreCientifico ? f.nombreCientifico : '';
  const dias = diasContigo(p);

  // ── Fondo ──
  const fondo = ctx.createLinearGradient(0, 0, 0, H);
  fondo.addColorStop(0, '#052E16');
  fondo.addColorStop(1, '#020A05');
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, W, H);

  // ── Foto portada (cover en la mitad superior) ──
  const FOTO_H = 680;
  let fotoCubierta = false;
  if (p.fotoDataUrl) {
    try {
      const img = await cargarImagen(p.fotoDataUrl);
      const escala = Math.max(W / img.width, FOTO_H / img.height);
      const dw = img.width * escala, dh = img.height * escala;
      ctx.drawImage(img, (W - dw) / 2, (FOTO_H - dh) / 2, dw, dh);
      fotoCubierta = true;
    } catch { /* sin foto → gradiente */ }
  }
  if (!fotoCubierta) {
    const g = ctx.createLinearGradient(0, 0, W, FOTO_H);
    g.addColorStop(0, '#0a3d2a');
    g.addColorStop(1, '#052E16');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, FOTO_H);
    ctx.font = '220px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿', W / 2, 420);
    ctx.textAlign = 'left';
  }

  // Degradado para fundir la foto con el fondo
  const fundido = ctx.createLinearGradient(0, FOTO_H - 260, 0, FOTO_H + 60);
  fundido.addColorStop(0, 'rgba(5,46,22,0)');
  fundido.addColorStop(1, '#052E16');
  ctx.fillStyle = fundido;
  ctx.fillRect(0, FOTO_H - 260, W, 320);

  // ── Marca arriba a la izquierda ──
  ctx.fillStyle = 'rgba(2,10,5,0.55)';
  const marcaTxt = 'PLANTTRACK';
  ctx.font = 'bold 34px sans-serif';
  const mw = ctx.measureText(marcaTxt).width;
  roundRect(ctx, 40, 40, mw + 56, 64, 32);
  ctx.fill();
  ctx.fillStyle = '#6EE7B7';
  ctx.fillText(marcaTxt, 68, 82);

  // ── Nombre ──
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 64px sans-serif';
  const nombreRecortado = nombre.length > 22 ? nombre.slice(0, 21) + '…' : nombre;
  ctx.fillText(nombreRecortado, 48, FOTO_H + 80);

  if (cientifico) {
    ctx.fillStyle = '#A7F3D0';
    ctx.font = 'italic 34px sans-serif';
    const cienRecortado = cientifico.length > 42 ? cientifico.slice(0, 41) + '…' : cientifico;
    ctx.fillText(cienRecortado, 48, FOTO_H + 136);
  }

  // Nombre regional (si existe y es distinto)
  if (f.nombreLocal && !nombre.includes(f.nombreLocal) && p.apodo) {
    ctx.fillStyle = '#6EE7B7';
    ctx.font = '30px sans-serif';
    ctx.fillText(`En tu zona: ${f.nombreLocal}`, 48, FOTO_H + 182);
  }

  // ── Chips de cuidados ──
  const chips: { emoji: string; texto: string }[] = [
    { emoji: '💧', texto: `Riego: ${f.cuidados.riego.frecuenciaTexto || `cada ${f.cuidados.riego.frecuenciaDias} días`}` },
    { emoji: '☀️', texto: `Luz: ${(f.cuidados.luz || 'indirecta').slice(0, 40)}` },
    { emoji: '🌡️', texto: `${f.cuidados.temperatura?.ideal || `${f.cuidados.temperatura?.minima ?? '-'}-${f.cuidados.temperatura?.maxima ?? '-'}°C`}` },
    { emoji: '🧪', texto: `Abono: ${(f.abono.tipo || 'equilibrado').slice(0, 38)}` },
  ];
  let cy = FOTO_H + 240;
  for (const chip of chips) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, 48, cy, 984, 78, 24);
    ctx.fill();
    ctx.font = '38px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(chip.emoji, 76, cy + 53);
    ctx.font = 'bold 31px sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(chip.texto, 138, cy + 52);
    cy += 96;
  }

  // ── Stats inferiores ──
  const statsY = cy + 30;
  ctx.strokeStyle = 'rgba(110,231,183,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, statsY);
  ctx.lineTo(W - 48, statsY);
  ctx.stroke();

  const stats: [string, string][] = [
    ['❤️', dias > 0 ? `${dias} días juntos` : 'Nuevo en el jardín'],
    ['📏', p.alturaCm != null ? `${p.alturaCm} cm de alto` : 'Sin medir aún'],
    ['🎯', `Dificultad: ${f.dificultad === 'facil' ? 'fácil' : f.dificultad === 'media' ? 'media' : 'difícil'}`],
  ];
  ctx.font = 'bold 30px sans-serif';
  let sy = statsY + 58;
  for (const [emoji, texto] of stats) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(emoji, 48, sy);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(texto, 104, sy);
    sy += 52;
  }

  // ── Footer ──
  ctx.fillStyle = 'rgba(110,231,183,0.9)';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('🌿 Identificada y cuidada con PlantTrack V2', 48, H - 56);

  return canvas.toDataURL('image/png').split(',')[1]!; // sin prefijo data:
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Genera la tarjeta y la comparte (nativo) o descarga (web). */
export async function compartirFichaImagen(
  p: PlantaGuardada,
  onToast: (tipo: 'exito' | 'error' | 'info', texto: string) => void,
): Promise<void> {
  try {
    const base64 = await generarTarjetaPlanta(p);
    const nombreArchivo = `planttrack-${(p.apodo || p.ficha.nombreComun || 'planta').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;

    if (esNativo()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const resultado = await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64,
        directory: Directory.Cache,
      });
      await Share.share({
        title: p.apodo || p.ficha.nombreComun,
        text: `🌿 Mira ${p.apodo || p.ficha.nombreComun} — su ficha de PlantTrack`,
        files: [resultado.uri],
        dialogTitle: 'Compartir ficha',
      });
    } else {
      // Web: descargar (y si el navegador soporta Web Share level 2, compartir)
      const blob = base64ABlob(base64, 'image/png');
      const archivo = new File([blob], nombreArchivo, { type: 'image/png' });
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({
          files: [archivo],
          title: p.apodo || p.ficha.nombreComun,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        URL.revokeObjectURL(url);
        onToast('exito', '🖼️ Tarjeta de la planta descargada');
        return;
      }
    }
    onToast('exito', '🖼️ Tarjeta compartida');
  } catch (e: any) {
    if (e?.message === 'Cancelaste el selector') return;
    onToast('error', e?.message?.includes('no-image') ? 'No pude generar la tarjeta' : 'No se pudo compartir la tarjeta');
  }
}

function base64ABlob(base64: string, tipo: string): Blob {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: tipo });
}
