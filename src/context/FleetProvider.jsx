import { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { FleetContext } from "./fleetContext"
import { fleetReducer } from "./fleetReducer"
import {
  clientesIniciales,
  conductoresIniciales,
  mantencionesIniciales,
  vehiculosIniciales,
  viajesIniciales,
} from "../data/initialData"

const estadoInicial = {
  vehiculos: vehiculosIniciales,
  conductores: conductoresIniciales,
  clientes: clientesIniciales,
  trips: viajesIniciales,
  maintenance: mantencionesIniciales,
  fuelLogs: [],
}

const hoy = () => new Date().toISOString().slice(0, 10)

export function FleetProvider({ children }) {
  const [state, dispatch] = useReducer(fleetReducer, estadoInicial)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg) => setToast({ msg, key: Date.now() }), [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const actions = useMemo(
    () => ({
      solicitarViaje: (data) => {
        dispatch({ type: "SOLICITAR_VIAJE", payload: data })
        showToast("Solicitud de viaje enviada.")
      },
      asignarViaje: (id, patente, conductorId) => {
        const v = state.vehiculos.find((v) => v.patente === patente)
        const c = state.conductores.find((c) => c.id === conductorId)
        dispatch({ type: "ASIGNAR_VIAJE", payload: { id, patente, conductorId } })
        showToast(`Viaje ${id} asignado a ${v?.patente} / ${c?.nombre}.`)
      },
      cancelarViaje: (id) => {
        dispatch({ type: "CANCELAR_VIAJE", payload: { id } })
        showToast(`Viaje ${id} cancelado.`)
      },
      avanzarViaje: (id, to) => {
        dispatch({ type: "AVANZAR_VIAJE", payload: { id, to } })
        showToast("Estado del viaje actualizado.")
      },
      agregarNovedad: (id, texto) => {
        dispatch({ type: "AGREGAR_NOVEDAD", payload: { id, texto } })
        showToast("Novedad reportada al supervisor.")
      },
      actualizarUbicacion: (id, lugar) => {
        const hora = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
        dispatch({ type: "ACTUALIZAR_UBICACION", payload: { id, lugar, hora } })
        showToast("Ubicación actualizada. El cliente ya puede verla.")
      },
      registrarCombustible: (tripId, litros, costo) => {
        dispatch({ type: "REGISTRAR_COMBUSTIBLE", payload: { tripId, litros, costo, fecha: hoy() } })
        showToast("Carga de combustible registrada.")
      },
      registrarMantencion: (data) => {
        dispatch({ type: "REGISTRAR_MANTENCION", payload: data })
        showToast("Mantención registrada. El vehículo quedó no disponible.")
      },
      cerrarMantencion: (id) => {
        dispatch({ type: "CERRAR_MANTENCION", payload: { id } })
        showToast("Mantención cerrada. Vehículo disponible nuevamente.")
      },
    }),
    [state.vehiculos, state.conductores, showToast]
  )

  return <FleetContext.Provider value={{ ...state, ...actions, toast }}>{children}</FleetContext.Provider>
}
