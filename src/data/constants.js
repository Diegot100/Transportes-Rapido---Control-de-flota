export const SERVICE_TYPES = [
  {
    codigo: "TR001",
    nombre: "Carga completa",
    descripcion: "Servicio dedicado para un solo cliente.",
    base: 150000,
    km: 2500,
  },
  {
    codigo: "TR002",
    nombre: "Transporte compartido",
    descripcion: "Varias cargas de diferentes clientes.",
    base: 80000,
    km: 1500,
  },
  {
    codigo: "TR003",
    nombre: "Urgente",
    descripcion: "Servicio prioritario con entrega en 24 horas.",
    base: 250000,
    km: 3500,
  },
  {
    codigo: "TR004",
    nombre: "Carga especial",
    descripcion: "Productos que requieren condiciones especiales (temperatura, fragilidad).",
    base: 200000,
    km: 3000,
  },
]

export const ESTADO_INFO = {
  Solicitado: { cliente: "Hemos recibido tu solicitud de viaje y estamos asignando recursos.", clase: "b-solicitado" },
  Asignado: { cliente: "Se ha asignado un vehículo y conductor para tu viaje.", clase: "b-asignado" },
  "En tránsito": { cliente: "El vehículo se encuentra en camino a tu destino.", clase: "b-transito" },
  Entregado: { cliente: "El viaje ha sido completado exitosamente.", clase: "b-entregado" },
  Cancelado: { cliente: "El viaje fue cancelado.", clase: "b-cancelado" },
}

export const ESTADO_ORDEN = ["Solicitado", "Asignado", "En tránsito", "Entregado"]

export const KM_INTERVALO_MANTENCION = 20000

export const estadoVehiculoClase = (e) =>
  ({
    Disponible: "b-disponible",
    "En mantenimiento": "b-mantenimiento",
    "En taller": "b-taller",
    "En viaje": "b-viaje",
  })[e] || "b-descanso"

export const estadoConductorClase = (e) =>
  ({ Disponible: "b-disponible", "En viaje": "b-viaje", Descanso: "b-descanso" })[e] || "b-descanso"
