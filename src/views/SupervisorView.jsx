import { useState } from "react"
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { NovedadesModal } from "../components/TripModals"
import { estadoConductorClase, estadoVehiculoClase } from "../data/constants"
import { fmtNum } from "../utils/format"

const COLUMNAS = ["Solicitado", "Asignado", "En tránsito", "Entregado", "Cancelado"]

function SupervisorView() {
  const { trips, vehiculos, conductores } = useFleet()
  const [novedadesDe, setNovedadesDe] = useState(null)

  const tripNovedades = trips.find((t) => t.id === novedadesDe)

  return (
    <>
      <RoleHead
        title="Tablero de despacho"
        description="Asigna vehículos y conductores disponibles a las solicitudes pendientes y sigue cada viaje hasta su entrega."
      />

      <Row xs={1} md={2} xl={5} className="g-3">
        {COLUMNAS.map((col) => {
          const items = trips.filter((t) => t.estado === col)
          return (
            <Col key={col}>
              <div className="board-col h-100">
                <div className="board-col-head">
                  {col} <span className="count">{items.length}</span>
                </div>
                <div className="board-body">
                  {items.length === 0 ? (
                    <p className="small text-secondary p-1 mb-0">Sin viajes.</p>
                  ) : (
                    items.map((t) => <BoardTile key={t.id} trip={t} col={col} onVerNovedades={setNovedadesDe} />)
                  )}
                </div>
              </div>
            </Col>
          )
        })}
      </Row>

      <Row className="g-4 mt-1">
        <Col xl={7}>
          <h3 className="section-title mt-0">Disponibilidad de vehículos</h3>
          <Card>
            <Card.Body>
              <Table responsive hover size="sm" className="align-middle mb-0">
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
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={5}>
          <h3 className="section-title mt-0">Disponibilidad de conductores</h3>
          <Card>
            <Card.Body>
              <Table responsive hover size="sm" className="align-middle mb-0">
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
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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

  return (
    <div className="trip-tile">
      <div className="tt-id">{t.id}</div>
      <div>
        {t.origen} → {t.destino}
      </div>
      <div className="text-secondary">
        {cliente?.nombre} · {t.kmEstimado} km
      </div>
      {t.vehiculo && (
        <div className="text-secondary">
          Vehículo {t.vehiculo}
          {t.conductorId ? " · " + conductor?.nombre : ""}
        </div>
      )}

      {col === "Solicitado" &&
        (vehiculosLibres.length && conductoresLibres.length ? (
          <div className="d-grid gap-2 mt-2">
            <Form.Select
              size="sm"
              aria-label={`Vehículo para ${t.id}`}
              value={patenteSel}
              onChange={(e) => setPatente(e.target.value)}
            >
              {vehiculosLibres.map((v) => (
                <option key={v.patente} value={v.patente}>
                  {v.patente} ({v.marca})
                </option>
              ))}
            </Form.Select>
            <Form.Select
              size="sm"
              aria-label={`Conductor para ${t.id}`}
              value={condSel}
              onChange={(e) => setCondId(e.target.value)}
            >
              {conductoresLibres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Form.Select>
            <div className="d-flex gap-2">
              <Button size="sm" className="flex-fill" onClick={() => asignarViaje(t.id, patenteSel, Number(condSel))}>
                Asignar
              </Button>
              <Button size="sm" variant="outline-secondary" className="flex-fill" onClick={() => cancelarViaje(t.id)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="small text-danger mt-2 mb-2">Sin recursos libres ahora mismo.</p>
            <Button size="sm" variant="outline-secondary" onClick={() => cancelarViaje(t.id)}>
              Cancelar
            </Button>
          </>
        ))}

      {(col === "Asignado" || col === "En tránsito") && (
        <Button size="sm" variant="outline-secondary" className="mt-2" onClick={() => onVerNovedades(t.id)}>
          Ver novedades ({t.novedades.length})
        </Button>
      )}
    </div>
  )
}

export default SupervisorView
