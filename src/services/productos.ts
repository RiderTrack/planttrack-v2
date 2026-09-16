// ═══════════════════════════════════════════════════════════
// 🧪 PLANTTRACK V2 — services/productos.ts
// "Mi Botiquín": los productos de jardinería que el usuario
// analiza con la IA (insecticidas, abonos, fungicidas…).
// CRUD sobre localStorage, mismo patrón que jardin.ts.
//
// Las FOTOS de los envases son caché local (como las de las
// plantas): no se sincronizan a la nube para no gastar Storage.
// ═══════════════════════════════════════════════════════════

import type { ProductoGuardado } from '../types';
import { registrarActividad } from './logros';

const LS_BOTIQUIN = 'planttrack.botiquin';

function leerTodo(): ProductoGuardado[] {
  try {
    const crudo = localStorage.getItem(LS_BOTIQUIN);
    if (crudo) return JSON.parse(crudo) as ProductoGuardado[];
  } catch { /* corrupto → botiquín vacío */ }
  return [];
}

function escribirTodo(productos: ProductoGuardado[]): void {
  localStorage.setItem(LS_BOTIQUIN, JSON.stringify(productos));
}

export function listarProductos(): ProductoGuardado[] {
  return leerTodo().sort((a, b) => a.fechaRegistro < b.fechaRegistro ? 1 : -1);
}

export function obtenerProducto(id: string): ProductoGuardado | undefined {
  return leerTodo().find(p => p.id === id);
}

/** Guarda (o re-guarda) un producto analizado → Mi Botiquín. */
export function guardarProducto(producto: ProductoGuardado): void {
  const todos = leerTodo().filter(p => p.id !== producto.id);
  todos.push(producto);
  escribirTodo(todos);
  registrarActividad(12); // 🏆 XP por cuidar con productos
}

export function eliminarProducto(id: string): void {
  escribirTodo(leerTodo().filter(p => p.id !== id));
}

/** ¿Ya guardamos un producto con este nombre? (evita duplicados) */
export function yaExisteProducto(nombre: string): ProductoGuardado | undefined {
  const n = nombre.trim().toLowerCase();
  if (!n) return undefined;
  return leerTodo().find(p => p.analisis.nombre?.trim().toLowerCase() === n);
}

/** Lee el botiquín crudo (para el respaldo/export de Ajustes). */
export function exportarBotiquin(): ProductoGuardado[] {
  return leerTodo();
}

/** Importa productos de un respaldo (merge, sin duplicar por nombre). */
export function importarBotiquin(productos: ProductoGuardado[]): number {
  const actuales = leerTodo();
  const nombres = new Set(actuales.map(p => p.analisis.nombre?.trim().toLowerCase()));
  const nuevos = (productos || []).filter(
    p => p?.id && p?.analisis && !nombres.has(p.analisis.nombre?.trim().toLowerCase()),
  );
  if (nuevos.length > 0) escribirTodo([...actuales, ...nuevos]);
  return nuevos.length;
}
