// ═══════════════════════════════════════════════════════════
// 🖼️ PLANTTRACK V2 — utils/imagen.ts
// Redimensiona cualquier imagen a JPEG óptimo para la IA
// (menos píxeles = menos tokens = respuesta más rápida).
// ═══════════════════════════════════════════════════════════

export function redimensionarJPEG(
  dataUrl: string,
  ladoMax: number,
  calidad: number,
): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, ladoMax / Math.max(img.width, img.height));
      const w = Math.round(img.width * escala);
      const h = Math.round(img.height * escala);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return rechazar(new Error('sin canvas'));
      ctx.fillStyle = '#ffffff'; // fondo blanco para PNG con alpha
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolver(canvas.toDataURL('image/jpeg', calidad));
    };
    img.onerror = () => rechazar(new Error('imagen inválida'));
    img.src = dataUrl;
  });
}
