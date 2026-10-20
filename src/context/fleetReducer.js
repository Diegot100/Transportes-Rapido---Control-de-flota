import { crearViaje, makeId } from "../data/initialData"

const mapBy = (arr, pred, fn) => arr.map((x) => (pred(x) ? fn(x) : x))

export function fleetReducer(state, action) {
  switch (action.type) {
    case "SOLICITAR_VIAJE": {
      const viaje = crearViaje(state.trips.length + 1, { ...action.payload, estado: "Solicitado" })
      return { ...state, trips: [...state.trips, viaje] }
    }

    case "ASIGNAR_VIAJE": {
      const { id, patente, conductorId } = action.payload
      return {
        ...state,
        trips: mapBy(
          state.trips,
          (t) => t.id === id,
          (t) => ({
            ...t,
            vehiculo: patente,
            conductorId,
            estado: "Asignado",
          })
        ),
        vehiculos: mapBy(
          state.vehiculos,
          (v) => v.patente === patente,
          (v) => ({ ...v, estado: "En viaje" })
        ),
        conductores: mapBy(
          state.conductores,
          (c) => c.id === conductorId,
          (c) => ({ ...c, estado: "En viaje" })
        ),
      }
    }

    case "CANCELAR_VIAJE":
      return {
        ...state,
        trips: mapBy(
          state.trips,
          (t) => t.id === action.payload.id,
          (t) => ({ ...t, estado: "Cancelado" })
        ),
      }

    case "AVANZAR_VIAJE": {
      const { id, to } = action.payload
      const trip = state.trips.find((t) => t.id === id)
      if (!trip) return state

      let vehiculos = state.vehiculos
      let conductores = state.conductores

      if (to === "En tránsito") {
        vehiculos = mapBy(
          vehiculos,
          (v) => v.patente === trip.vehiculo,
          (v) => ({ ...v, estado: "En viaje" })
        )
        conductores = mapBy(
          conductores,
          (c) => c.id === trip.conductorId,
          (c) => ({ ...c, estado: "En viaje" })
        )
      }
      if (to === "Entregado") {
        vehiculos = mapBy(
          vehiculos,
          (v) => v.patente === trip.vehiculo,
          (v) => ({
            ...v,
            estado: "Disponible",
            km: v.km + trip.kmEstimado,
          })
        )
        conductores = mapBy(
          conductores,
          (c) => c.id === trip.conductorId,
          (c) => ({
            ...c,
            estado: "Disponible",
            viajesCompletados: c.viajesCompletados + 1,
          })
        )
      }

      return {
        ...state,
        vehiculos,
        conductores,
        trips: mapBy(
          state.trips,
          (t) => t.id === id,
          (t) => ({
            ...t,
            estado: to,
            retrasado: to === "Entregado" && t.novedades.length > 0 ? true : t.retrasado,
          })
        ),
      }
    }

    case "AGREGAR_NOVEDAD":
      return {
        ...state,
        trips: mapBy(
          state.trips,
          (t) => t.id === action.payload.id,
          (t) => ({
            ...t,
            novedades: [...t.novedades, action.payload.texto],
          })
        ),
      }

    case "ACTUALIZAR_UBICACION":
      return {
        ...state,
        trips: mapBy(
          state.trips,
          (t) => t.id === action.payload.id,
          (t) => ({
            ...t,
            ubicacion: action.payload.lugar,
            ubicacionFecha: action.payload.hora,
          })
        ),
      }

    case "REGISTRAR_COMBUSTIBLE": {
      const { tripId, litros, costo, fecha } = action.payload
      const trip = state.trips.find((t) => t.id === tripId)
      if (!trip) return state
      return {
        ...state,
        fuelLogs: [
          ...state.fuelLogs,
          {
            id: makeId("F", state.fuelLogs.length + 1, 4),
            patente: trip.vehiculo,
            conductorId: trip.conductorId,
            litros,
            costo,
            fecha,
          },
        ],
      }
    }

    case "REGISTRAR_MANTENCION": {
      const { vehiculo, tipo, detalle, fecha } = action.payload
      return {
        ...state,
        maintenance: [
          ...state.maintenance,
          { id: makeId("M", state.maintenance.length + 1, 3), vehiculo, tipo, detalle, fecha, estado: "En curso" },
        ],
        vehiculos: mapBy(
          state.vehiculos,
          (v) => v.patente === vehiculo,
          (v) => ({ ...v, estado: "En mantenimiento" })
        ),
      }
    }

    case "CERRAR_MANTENCION": {
      const m = state.maintenance.find((m) => m.id === action.payload.id)
      if (!m) return state
      return {
        ...state,
        maintenance: mapBy(
          state.maintenance,
          (x) => x.id === m.id,
          (x) => ({ ...x, estado: "Terminada" })
        ),
        vehiculos: mapBy(
          state.vehiculos,
          (v) => v.patente === m.vehiculo,
          (v) => ({
            ...v,
            estado: "Disponible",
            kmUltMant: v.km,
          })
        ),
      }
    }

    default:
      return state
  }
}
