import { useState } from "react"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { CombustibleModal, TextPromptModal } from "../components/TripModals"
import { ESTADO_INFO } from "../data/constants"
import { fmtCLP } from "../utils/format"

export default function ConductorView({ conductorId, onChangeConductor }) {
  const {
    conductores,
    trips,
    fuelLogs,
    avanzarViaje,
    agregarNovedad,
    actualizarUbicacion,
    registrarCombustible,
    clientes,
  } = useFleet()
  const [modal, setModal] = useState(null)

  const misViajes = trips.filter(
    (t) => t.conductorId === conductorId && (t.estado === "Asignado" || t.estado === "En tránsito")
  )
  const historial = trips
    .filter((t) => t.conductorId === conductorId && (t.estado === "Entregado" || t.estado === "Cancelado"))
    .slice(-5)
    .reverse()
  const misCargas = fuelLogs
    .filter((f) => f.conductorId === conductorId)
    .slice(-5)
    .reverse()

  const cerrar = () => setModal(null)

  return (
    <>
      <RoleHead
        title="App del conductor"
        description="Pantalla pensada para uso en el teléfono, con botones grandes e instrucciones claras."
      >
        <div className="as-select">
          Viendo como
          <select
            aria-label="Conductor"
            value={conductorId}
            onChange={(e) => onChangeConductor(Number(e.target.value))}
          >
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </RoleHead>

      <h3 className="section-title">Viajes asignados</h3>
      {misViajes.length === 0 ? (
        <div className="empty">No tienes viajes asignados en este momento.</div>
      ) : (
        misViajes.map((t) => {
          const cliente = clientes.find((c) => c.id === t.clienteId)
          const siguiente =
            t.estado === "Asignado"
              ? { label: "Iniciar viaje (marcar en tránsito)", to: "En tránsito" }
              : { label: "Marcar como entregado", to: "Entregado" }
          const ghost = { background: "transparent", borderColor: "#3A424A", color: "#fff", marginTop: "0.5rem" }
          return (
            <div key={t.id} className="driver-card" style={{ marginBottom: "1rem" }}>
              <Badge
                clase={ESTADO_INFO[t.estado].clase}
                style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}
              >
                {t.estado}
              </Badge>
              <div className="tt-route">
                {t.origen} → {t.destino}
              </div>
              <div className="tt-meta">
                {t.id} · {cliente?.nombre} · Vehículo {t.vehiculo} · {t.kmEstimado} km
              </div>
              <div className="tt-meta">Carga: {t.carga}</div>
              {t.estado === "En tránsito" && (
                <div className="tt-meta" style={{ marginTop: "0.4rem" }}>
                  📍{" "}
                  {t.ubicacion ? (
                    <>
                      Ubicación reportada: <strong>{t.ubicacion}</strong> ({t.ubicacionFecha})
                    </>
                  ) : (
                    "Sin ubicación reportada aún"
                  )}
                </div>
              )}
              <button className="btn big" onClick={() => avanzarViaje(t.id, siguiente.to)}>
                {siguiente.label}
              </button>
              {t.estado === "En tránsito" && (
                <button
                  className="btn secondary big"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => setModal({ tipo: "ubicacion", tripId: t.id })}
                >
                  Actualizar mi ubicación
                </button>
              )}
              <button
                className="btn ghost big"
                style={ghost}
                onClick={() => setModal({ tipo: "novedad", tripId: t.id })}
              >
                Reportar novedad
              </button>
              <button
                className="btn ghost big"
                style={ghost}
                onClick={() => setModal({ tipo: "combustible", tripId: t.id })}
              >
                Registrar carga de combustible
              </button>
            </div>
          )
        })
      )}

      <h3 className="section-title">Historial reciente</h3>
      {historial.length === 0 ? (
        <div className="empty">Sin viajes completados aún.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Viaje</th>
              <th>Ruta</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>
                  {t.origen} → {t.destino}
                </td>
                <td>
                  <Badge clase={ESTADO_INFO[t.estado].clase}>{t.estado}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="section-title">Combustible cargado por mí</h3>
      {misCargas.length === 0 ? (
        <div className="empty">Aún no registras cargas de combustible.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Litros</th>
              <th>Costo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {misCargas.map((f) => (
              <tr key={f.id}>
                <td>{f.patente}</td>
                <td>{f.litros} L</td>
                <td>{fmtCLP(f.costo)}</td>
                <td>{f.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal?.tipo === "novedad" && (
        <TextPromptModal
          title="Reportar novedad"
          label="Describe la novedad del viaje"
          placeholder="Ej: tráfico, desperfecto menor"
          submitLabel="Reportar"
          onSubmit={(texto) => agregarNovedad(modal.tripId, texto)}
          onClose={cerrar}
        />
      )}
      {modal?.tipo === "ubicacion" && (
        <TextPromptModal
          title="Actualizar ubicación"
          label="¿En qué ciudad, comuna o tramo de ruta te encuentras ahora?"
          placeholder="Ej: Talca, Ruta 5 Sur"
          submitLabel="Actualizar"
          onSubmit={(lugar) => actualizarUbicacion(modal.tripId, lugar)}
          onClose={cerrar}
        />
      )}
      {modal?.tipo === "combustible" && (
        <CombustibleModal
          onSubmit={(litros, costo) => registrarCombustible(modal.tripId, litros, costo)}
          onClose={cerrar}
        />
      )}
    </>
  )
}
