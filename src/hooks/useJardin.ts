// ═══════════════════════════════════════════════════════════
// 🪴 PLANTTRACK V2 — hooks/useJardin.ts
// Estado reactivo del jardín: envuelve el CRUD de localStorage
// y avisa a las vistas cuando algo cambia.
// v1.2: expone TODAS las operaciones nuevas del jardín.
// ═══════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import type { PlantaGuardada, ProductoGuardado, Recordatorio, TipoRecordatorio, VerificacionRegional, Esqueje, EstadoEsqueje, MedioEsqueje } from '../types';
import {
  listarPlantas, guardarPlanta, eliminarPlanta,
  registrarRiego, ajustarFrecuencia,
  actualizarCampos, type CamposEditables,
  aplicarNombreRegional,
  agregarFoto, eliminarFoto,
  alternarEtiqueta,
  registrarAltura,
  agregarRecordatorio, completarRecordatorio, eliminarRecordatorio,
  aplicarProductoAPlanta,
} from '../services/jardin';
import { listarEsquejes, crearEsqueje, avanzarEsqueje, eliminarEsqueje } from '../services/esquejes';

export function useJardin() {
  const [plantas, setPlantas] = useState<PlantaGuardada[]>([]);
  const [esquejes, setEsquejes] = useState<Esqueje[]>([]);
  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(() => {
    setPlantas(listarPlantas());
    setEsquejes(listarEsquejes());
    setCargando(false);
  }, []);

  useEffect(() => {
    refrescar();
    // sincronizar si otra pestaña edita el jardín
    const fn = () => refrescar();
    window.addEventListener('storage', fn);
    return () => window.removeEventListener('storage', fn);
  }, [refrescar]);

  const agregar = useCallback((p: PlantaGuardada) => {
    guardarPlanta(p);
    refrescar();
  }, [refrescar]);

  const quitar = useCallback((id: string) => {
    eliminarPlanta(id);
    refrescar();
  }, [refrescar]);

  const regar = useCallback((id: string) => {
    registrarRiego(id);
    refrescar();
  }, [refrescar]);

  const ajustar = useCallback((id: string, dias: number) => {
    ajustarFrecuencia(id, dias);
    refrescar();
  }, [refrescar]);

  // ── v1.2 ──
  const editar = useCallback((id: string, campos: CamposEditables) => {
    actualizarCampos(id, campos);
    refrescar();
  }, [refrescar]);

  const aplicarRegional = useCallback((id: string, verif: VerificacionRegional) => {
    aplicarNombreRegional(id, verif);
    refrescar();
  }, [refrescar]);

  const conFoto = useCallback((id: string, dataUrl: string, nota?: string) => {
    agregarFoto(id, dataUrl, nota);
    refrescar();
  }, [refrescar]);

  const sinFoto = useCallback((id: string, fotoId: string) => {
    eliminarFoto(id, fotoId);
    refrescar();
  }, [refrescar]);

  const etiqueta = useCallback((id: string, et: string) => {
    alternarEtiqueta(id, et);
    refrescar();
  }, [refrescar]);

  const medir = useCallback((id: string, cm: number) => {
    registrarAltura(id, cm);
    refrescar();
  }, [refrescar]);

  const nuevoRecordatorio = useCallback((id: string, tipo: TipoRecordatorio, dias: number, nota?: string) => {
    agregarRecordatorio(id, tipo, dias, nota);
    refrescar();
  }, [refrescar]);

  const hacerRecordatorio = useCallback((id: string, recId: string) => {
    completarRecordatorio(id, recId);
    refrescar();
  }, [refrescar]);

  const borrarRecordatorio = useCallback((id: string, recId: string) => {
    eliminarRecordatorio(id, recId);
    refrescar();
  }, [refrescar]);

  // ── v1.3 ──
  const aplicarProducto = useCallback((id: string, producto: ProductoGuardado, nota?: string) => {
    aplicarProductoAPlanta(id, producto, nota);
    refrescar();
  }, [refrescar]);

  // ── v1.4: esquejes ──
  const nuevoEsqueje = useCallback((datos: { nombre: string; especie: string; plantaId?: string; medio: MedioEsqueje; nota?: string }) => {
    crearEsqueje(datos);
    refrescar();
  }, [refrescar]);

  const avanzarEstadoEsqueje = useCallback((id: string, estado: EstadoEsqueje) => {
    avanzarEsqueje(id, estado);
    refrescar();
  }, [refrescar]);

  const quitarEsqueje = useCallback((id: string) => {
    eliminarEsqueje(id);
    refrescar();
  }, [refrescar]);

  return {
    plantas, esquejes, cargando, refrescar, agregar, quitar, regar, ajustar,
    // v1.2
    editar, aplicarRegional, conFoto, sinFoto, etiqueta, medir,
    nuevoRecordatorio, hacerRecordatorio, borrarRecordatorio,
    // v1.3
    aplicarProducto,
    // v1.4
    nuevoEsqueje, avanzarEstadoEsqueje, quitarEsqueje,
  };
}
