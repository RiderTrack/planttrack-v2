// ═══════════════════════════════════════════════════════════
// 📸 PLANTTRACK V2 — services/camara.ts
// Captura de foto con transporte dual:
//   • APK → Capacitor Camera (cámara nativa con permisos)
//   • Web → <input type="file" capture> (cámara o galería)
// Siempre devuelve un JPEG listo para la IA (máx 1024 px).
// ═══════════════════════════════════════════════════════════

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { esNativo } from './plataforma';
import { redimensionarJPEG } from '../utils/imagen';

export interface FotoPlanta {
  dataUrl: string;   // miniatura para la UI
  base64: string;    // sin prefijo data: — para Claude
  mediaType: string; // 'image/jpeg'
}

/** Abre la cámara (nativo) o el selector con cámara (web). */
export async function tomarFoto(): Promise<FotoPlanta | null> {
  if (esNativo()) {
    const foto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // pregunta: cámara o galería
      quality: 85,
      width: 1280,
      correctOrientation: true,
    });
    return await preparar(foto.dataUrl || '');
  }
  // Web: input file con capture (móvil abre la cámara)
  const archivo = await elegirArchivo(true);
  return archivo ? await preparar(archivo) : null;
}

/** Solo galería / archivo existente. */
export async function elegirDeGaleria(): Promise<FotoPlanta | null> {
  if (esNativo()) {
    const foto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      quality: 85,
      width: 1280,
    });
    return await preparar(foto.dataUrl || '');
  }
  const archivo = await elegirArchivo(false);
  return archivo ? await preparar(archivo) : null;
}

function elegirArchivo(conCamara: boolean): Promise<string | null> {
  return new Promise(resolver => {
    // Input persistente (reutilizable y accesible para tests E2E)
    let input = document.getElementById('input-foto-planttrack') as HTMLInputElement | null;
    if (!input) {
      input = document.createElement('input');
      input.id = 'input-foto-planttrack';
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.setAttribute('aria-hidden', 'true');
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      document.body.appendChild(input);
    }
    if (conCamara) input.setAttribute('capture', 'environment');
    else input.removeAttribute('capture');
    input.value = '';
    input.onchange = () => {
      const f = input!.files?.[0];
      if (!f) return resolver(null);
      const lector = new FileReader();
      lector.onload = () => resolver(lector.result as string);
      lector.onerror = () => resolver(null);
      lector.readAsDataURL(f);
    };
    input.click();
  });
}

/** Normaliza cualquier formato a JPEG 1024px para la IA. */
async function preparar(dataUrl: string): Promise<FotoPlanta | null> {
  try {
    const jpeg = await redimensionarJPEG(dataUrl, 1024, 0.85);
    return {
      dataUrl: jpeg,
      base64: jpeg.split(',')[1] || '',
      mediaType: 'image/jpeg',
    };
  } catch {
    return null;
  }
}
