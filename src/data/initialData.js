import { SERVICE_TYPES } from "./constants"

export const vehiculosIniciales = [
  {
    patente: "AB1234",
    marca: "Volvo",
    modelo: "FH 500",
    anio: 2020,
    tipo: "Tracto",
    capacidad: 30000,
    km: 145000,
    kmUltMant: 130000,
    estado: "Disponible",
  },
  {
    patente: "CD5678",
    marca: "Scania",
    modelo: "R 450",
    anio: 2019,
    tipo: "Tracto",
    capacidad: 28000,
    km: 180000,
    kmUltMant: 160000,
    estado: "En mantenimiento",
  },
  {
    patente: "EF9012",
    marca: "Mercedes",
    modelo: "Actros 2545",
    anio: 2021,
    tipo: "Tracto",
    capacidad: 32000,
    km: 95000,
    kmUltMant: 90000,
    estado: "Disponible",
  },
  {
    patente: "GH3456",
    marca: "MAN",
    modelo: "TGS 480",
    anio: 2018,
    tipo: "Tracto",
    capacidad: 26000,
    km: 210000,
    kmUltMant: 185000,
    estado: "Disponible",
  },
  {
    patente: "IJ7890",
    marca: "Ford",
    modelo: "Cargo 816",
    anio: 2020,
    tipo: "Camion",
    capacidad: 8000,
    km: 65000,
    kmUltMant: 60000,
    estado: "En taller",
  },
]

export const conductoresIniciales = [
  { id: 1, nombre: "Héctor Rojas", estado: "Disponible", viajesCompletados: 14, licencia: "A5" },
  { id: 2, nombre: "Marcela Toro", estado: "Disponible", viajesCompletados: 9, licencia: "A5" },
  { id: 3, nombre: "Iván Peña", estado: "En viaje", viajesCompletados: 21, licencia: "A4" },
  { id: 4, nombre: "Soledad Vera", estado: "Descanso", viajesCompletados: 6, licencia: "A5" },
]

export const clientesIniciales = [
  { id: 1, nombre: "Comercial Andes SpA" },
  { id: 2, nombre: "Distribuidora Sur Ltda." },
  { id: 3, nombre: "Constructora Los Robles" },
]

export const makeId = (prefix, n, pad) => prefix + "-" + String(n).padStart(pad, "0")

export function crearViaje(seq, o) {
  const s = SERVICE_TYPES.find((s) => s.codigo === o.servicio)
  return {
    id: makeId("V", seq, 4),
    clienteId: o.clienteId,
    origen: o.origen,
    destino: o.destino,
    servicio: o.servicio,
    carga: o.carga,
    kmEstimado: o.kmEstimado,
    costo: s.base + s.km * o.kmEstimado,
    estado: o.estado || "Solicitado",
    vehiculo: o.vehiculo || null,
    conductorId: o.conductorId || null,
    novedades: [],
    fecha: new Date().toISOString().slice(0, 10),
    ubicacion: null,
    ubicacionFecha: null,
    retrasado: false,
  }
}

const seeds = [
  {
    clienteId: 1,
    origen: "Santiago",
    destino: "Concepción",
    servicio: "TR001",
    carga: "Repuestos industriales",
    kmEstimado: 520,
    estado: "Entregado",
    vehiculo: "EF9012",
    conductorId: 3,
  },
  {
    clienteId: 2,
    origen: "Santiago",
    destino: "Rancagua",
    servicio: "TR002",
    carga: "Abarrotes retail",
    kmEstimado: 88,
    estado: "En tránsito",
    vehiculo: "GH3456",
    conductorId: 3,
  },
  {
    clienteId: 3,
    origen: "Santiago",
    destino: "Talca",
    servicio: "TR004",
    carga: "Materiales de construcción refrigerados",
    kmEstimado: 260,
    estado: "Asignado",
    vehiculo: "AB1234",
    conductorId: 1,
  },
  {
    clienteId: 1,
    origen: "Santiago",
    destino: "La Serena",
    servicio: "TR003",
    carga: "Piezas urgentes de línea productiva",
    kmEstimado: 470,
    estado: "Solicitado",
  },
  {
    clienteId: 2,
    origen: "Santiago",
    destino: "Valparaíso",
    servicio: "TR002",
    carga: "Mercadería mixta",
    kmEstimado: 115,
    estado: "Cancelado",
  },
]
export const viajesIniciales = seeds.map((s, i) => crearViaje(i + 1, s))

export const mantencionesIniciales = [
  {
    id: "M-001",
    vehiculo: "CD5678",
    tipo: "Correctivo",
    detalle: "Falla en sistema de frenos",
    fecha: "2026-09-05",
    estado: "En curso",
  },
  {
    id: "M-002",
    vehiculo: "IJ7890",
    tipo: "Correctivo",
    detalle: "Revisión de motor",
    fecha: "2026-09-02",
    estado: "En curso",
  },
  {
    id: "M-003",
    vehiculo: "GH3456",
    tipo: "Preventivo",
    detalle: "Cambio de aceite y filtros (210.000 km)",
    fecha: "2026-09-12",
    estado: "Programado",
  },
]

export const combustibleInicial = []
