// ═══════════════════════════════════════════════════════════
// 🪴 PLANTTRACK V2 — hooks/useJardin.ts
// Estado reactivo del jardín: envuelve el CRUD de localStorage
// y avisa a las vistas cuando algo cambia.
// ═══════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import type { PlantaGuardada } from '../types';
import {
  listarPlantas, guardarPlanta, eliminarPlanta,
  registrarRiego, ajustarFrecuencia,
} from '../services/jardin';

export function useJardin() {
  const [plantas, setPlantas] = useState<PlantaGuardada[]>([]);
  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(() => {
    setPlantas(listarPlantas());
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

  return { plantas, cargando, refrescar, agregar, quitar, regar, ajustar };
}
