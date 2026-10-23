import { describe, it, expect } from "vitest"
import { fleetReducer } from "./fleetReducer"
import {
  clientesIniciales,
  conductoresIniciales,
  mantencionesIniciales,
  vehiculosIniciales,
  viajesIniciales,
} from "../data/initialData"

const crearEstado = () => ({
  vehiculos: vehiculosIniciales,
  conductores: conductoresIniciales,
  clientes: clientesIniciales,
  trips: viajesIniciales,
  maintenance: mantencionesIniciales,
  fuelLogs: [],
})

const buscarViaje = (estado, id) => estado.trips.find((t) => t.id === id)
const buscarVehiculo = (estado, patente) => estado.vehiculos.find((v) => v.patente === patente)
const buscarConductor = (estado, id) => estado.conductores.find((c) => c.id === id)

describe("fleetReducer", () => {
  it("SOLICITAR_VIAJE agrega un viaje solicitado con su costo calculado", () => {
    const estado = fleetReducer(crearEstado(), {
      type: "SOLICITAR_VIAJE",
      payload: { clienteId: 1, origen: "Santiago", destino: "Talca", servicio: "TR002", carga: "Abarrotes", kmEstimado: 260 },
    })

    const nuevo = estado.trips[estado.trips.length - 1]

    expect(estado.trips).toHaveLength(6)
    expect(nuevo.id).toBe("V-0006")
    expect(nuevo.estado).toBe("Solicitado")
    expect(nuevo.costo).toBe(80000 + 1500 * 260)
  })

  it("ASIGNAR_VIAJE asigna vehículo y conductor y los deja en viaje", () => {
    const estado = fleetReducer(crearEstado(), {
      type: "ASIGNAR_VIAJE",
      payload: { id: "V-0004", patente: "EF9012", conductorId: 2 },
    })

    expect(buscarViaje(estado, "V-0004").estado).toBe("Asignado")
    expect(buscarViaje(estado, "V-0004").vehiculo).toBe("EF9012")
    expect(buscarVehiculo(estado, "EF9012").estado).toBe("En viaje")
    expect(buscarConductor(estado, 2).estado).toBe("En viaje")
  })

  it("CANCELAR_VIAJE marca el viaje como cancelado", () => {
    const estado = fleetReducer(crearEstado(), { type: "CANCELAR_VIAJE", payload: { id: "V-0004" } })

    expect(buscarViaje(estado, "V-0004").estado).toBe("Cancelado")
  })

  it("AVANZAR_VIAJE a Entregado libera los recursos y suma kilómetros y viajes", () => {
    let estado = fleetReducer(crearEstado(), {
      type: "ASIGNAR_VIAJE",
      payload: { id: "V-0004", patente: "EF9012", conductorId: 2 },
    })
    const kmAntes = buscarVehiculo(estado, "EF9012").km
    const viajesAntes = buscarConductor(estado, 2).viajesCompletados

    estado = fleetReducer(estado, { type: "AVANZAR_VIAJE", payload: { id: "V-0004", to: "En tránsito" } })
    estado = fleetReducer(estado, { type: "AVANZAR_VIAJE", payload: { id: "V-0004", to: "Entregado" } })

    expect(buscarViaje(estado, "V-0004").estado).toBe("Entregado")
    expect(buscarVehiculo(estado, "EF9012").estado).toBe("Disponible")
    expect(buscarVehiculo(estado, "EF9012").km).toBe(kmAntes + 470)
    expect(buscarConductor(estado, 2).estado).toBe("Disponible")
    expect(buscarConductor(estado, 2).viajesCompletados).toBe(viajesAntes + 1)
  })

  it("un viaje entregado con novedades queda marcado como retrasado", () => {
    let estado = crearEstado()
    estado = fleetReducer(estado, { type: "AGREGAR_NOVEDAD", payload: { id: "V-0002", texto: "tráfico" } })
    estado = fleetReducer(estado, { type: "AVANZAR_VIAJE", payload: { id: "V-0002", to: "Entregado" } })

    expect(buscarViaje(estado, "V-0002").retrasado).toBe(true)
  })

  it("un viaje entregado sin novedades no queda retrasado", () => {
    const estado = fleetReducer(crearEstado(), {
      type: "AVANZAR_VIAJE",
      payload: { id: "V-0002", to: "Entregado" },
    })

    expect(buscarViaje(estado, "V-0002").retrasado).toBe(false)
  })

  it("ACTUALIZAR_UBICACION guarda el lugar y la hora del reporte", () => {
    const estado = fleetReducer(crearEstado(), {
      type: "ACTUALIZAR_UBICACION",
      payload: { id: "V-0002", lugar: "Talca", hora: "10:30" },
    })

    expect(buscarViaje(estado, "V-0002")).toMatchObject({ ubicacion: "Talca", ubicacionFecha: "10:30" })
  })

  it("REGISTRAR_COMBUSTIBLE guarda la carga con la patente y el conductor del viaje", () => {
    const estado = fleetReducer(crearEstado(), {
      type: "REGISTRAR_COMBUSTIBLE",
      payload: { tripId: "V-0002", litros: 80, costo: 96000, fecha: "2026-10-19" },
    })

    expect(estado.fuelLogs).toHaveLength(1)
    expect(estado.fuelLogs[0]).toMatchObject({ id: "F-0001", patente: "GH3456", conductorId: 3, litros: 80, costo: 96000 })
  })

  it("REGISTRAR_MANTENCION deja el vehículo en mantenimiento", () => {
    const estado = fleetReducer(crearEstado(), {
      type: "REGISTRAR_MANTENCION",
      payload: { vehiculo: "AB1234", tipo: "Preventivo", detalle: "Neumáticos", fecha: "2026-10-25" },
    })

    expect(estado.maintenance[estado.maintenance.length - 1].id).toBe("M-004")
    expect(buscarVehiculo(estado, "AB1234").estado).toBe("En mantenimiento")
  })

  it("CERRAR_MANTENCION devuelve el vehículo a disponible y reinicia su kilometraje de mantención", () => {
    const estado = fleetReducer(crearEstado(), { type: "CERRAR_MANTENCION", payload: { id: "M-001" } })
    const vehiculo = buscarVehiculo(estado, "CD5678")

    expect(estado.maintenance.find((m) => m.id === "M-001").estado).toBe("Terminada")
    expect(vehiculo.estado).toBe("Disponible")
    expect(vehiculo.kmUltMant).toBe(vehiculo.km)
  })

  it("ignora acciones sobre viajes o mantenciones que no existen", () => {
    const original = crearEstado()

    expect(fleetReducer(original, { type: "AVANZAR_VIAJE", payload: { id: "V-9999", to: "Entregado" } })).toBe(original)
    expect(fleetReducer(original, { type: "CERRAR_MANTENCION", payload: { id: "M-999" } })).toBe(original)
    expect(fleetReducer(original, { type: "ACCION_DESCONOCIDA" })).toBe(original)
  })

  it("no modifica el estado original", () => {
    const original = crearEstado()

    fleetReducer(original, { type: "CANCELAR_VIAJE", payload: { id: "V-0004" } })

    expect(buscarViaje(original, "V-0004").estado).toBe("Solicitado")
  })
})
