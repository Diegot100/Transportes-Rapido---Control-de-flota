import { useState } from "react"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { NovedadesModal } from "../components/TripModals"
import { estadoConductorClase, estadoVehiculoClase } from "../data/constants"
import { fmtNum } from "../utils/format"

const COLUMNAS = ["Solicitado", "Asignado", "En tránsito", "Entregado", "Cancelado"]

export default function SupervisorView() {
  const { trips, vehiculos, conductores } = useFleet()
  const [novedadesDe, setNovedadesDe] = useState(null)

  const tripNovedades = trips.find((t) => t.id === novedadesDe)

  return (
    <>
      <RoleHead
        title="Tablero de despacho"
        description="Asigna vehículos y conductores disponibles a las solicitudes pendientes y sigue cada viaje hasta su entrega."
      />

      <div className="board">
        {COLUMNAS.map((col) => {
          const items = trips.filter((t) => t.estado === col)
          return (
            <div key={col} className="board-col">
              <div className="board-col-head">
                {col} <span className="count">{items.length}</span>
              </div>
              <div className="board-body">
                {items.length === 0 ? (
                  <p className="small muted" style={{ padding: "0.3rem" }}>
                    Sin viajes.
                  </p>
                ) : (
                  items.map((t) => <BoardTile key={t.id} trip={t} col={col} onVerNovedades={setNovedadesDe} />)
                )}
              </div>
            </div>
          )
        })}
      </div>

      <h3 className="section-title">Disponibilidad de vehículos</h3>
      <table>
        <thead>
          <tr>
            <th>Patente</th>
            <th>Marca / modelo</th>
            <th>Tipo</th>
            <th>Capacidad</th>
            <th>Kilometraje</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((v) => (
            <tr key={v.patente}>
              <td>{v.patente}</td>
              <td>
                {v.marca} {v.modelo}
              </td>
              <td>{v.tipo}</td>
              <td>{fmtNum(v.capacidad)} kg</td>
              <td>{fmtNum(v.km)} km</td>
              <td>
                <Badge clase={estadoVehiculoClase(v.estado)}>{v.estado}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="section-title">Disponibilidad de conductores</h3>
      <table>
        <thead>
          <tr>
            <th>Conductor</th>
            <th>Licencia</th>
            <th>Viajes completados</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {conductores.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.licencia}</td>
              <td>{c.viajesCompletados}</td>
              <td>
                <Badge clase={estadoConductorClase(c.estado)}>{c.estado}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tripNovedades && <NovedadesModal trip={tripNovedades} onClose={() => setNovedadesDe(null)} />}
    </>
  )
}

function BoardTile({ trip: t, col, onVerNovedades }) {
  const { clientes, vehiculos, conductores, asignarViaje, cancelarViaje } = useFleet()
  const cliente = clientes.find((c) => c.id === t.clienteId)
  const conductor = conductores.find((c) => c.id === t.conductorId)

  const vehiculosLibres = vehiculos.filter((v) => v.estado === "Disponible")
  const conductoresLibres = conductores.filter((c) => c.estado === "Disponible")

  const [patente, setPatente] = useState("")
  const [condId, setCondId] = useState("")
  const patenteSel = vehiculosLibres.some((v) => v.patente === patente) ? patente : vehiculosLibres[0]?.patente
  const condSel = conductoresLibres.some((c) => String(c.id) === condId)
    ? condId
    : String(conductoresLibres[0]?.id ?? "")

  const selStyle = { padding: "0.25rem", fontSize: "0.75rem" }

  return (
    <div className="trip-tile">
      <div className="tt-id">{t.id}</div>
      <div>
        {t.origen} → {t.destino}
      </div>
      <div className="muted">
        {cliente?.nombre} · {t.kmEstimado} km
      </div>
      {t.vehiculo && (
        <div className="muted">
          Vehículo {t.vehiculo}
          {t.conductorId ? " · " + conductor?.nombre : ""}
        </div>
      )}

      {col === "Solicitado" &&
        (vehiculosLibres.length && conductoresLibres.length ? (
          <>
            <select
              style={{ ...selStyle, marginTop: "0.4rem" }}
              value={patenteSel}
              onChange={(e) => setPatente(e.target.value)}
            >
              {vehiculosLibres.map((v) => (
                <option key={v.patente} value={v.patente}>
                  {v.patente} ({v.marca})
                </option>
              ))}
            </select>
            <select
              style={{ ...selStyle, marginTop: "0.3rem" }}
              value={condSel}
              onChange={(e) => setCondId(e.target.value)}
            >
              {conductoresLibres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <div className="tt-actions">
              <button onClick={() => asignarViaje(t.id, patenteSel, Number(condSel))}>Asignar</button>
              <button onClick={() => cancelarViaje(t.id)}>Cancelar</button>
            </div>
          </>
        ) : (
          <>
            <p className="small" style={{ color: "var(--danger)", marginTop: "0.4rem" }}>
              Sin recursos libres ahora mismo.
            </p>
            <div className="tt-actions">
              <button onClick={() => cancelarViaje(t.id)}>Cancelar</button>
            </div>
          </>
        ))}

      {(col === "Asignado" || col === "En tránsito") && (
        <div className="tt-actions">
          <button onClick={() => onVerNovedades(t.id)}>Ver novedades ({t.novedades.length})</button>
        </div>
      )}
    </div>
  )
}
