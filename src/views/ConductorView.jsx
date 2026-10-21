import { useState } from "react"
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { CombustibleModal, TextPromptModal } from "../components/TripModals"
import { ESTADO_INFO } from "../data/constants"
import { fmtCLP } from "../utils/format"

function ConductorView({ conductorId, onChangeConductor }) {
  const {
    conductores,
    clientes,
    trips,
    fuelLogs,
    avanzarViaje,
    agregarNovedad,
    actualizarUbicacion,
    registrarCombustible,
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
        <div className="d-flex align-items-center gap-2 small text-secondary">
          <span>Viendo como</span>
          <Form.Select
            size="sm"
            className="w-auto"
            aria-label="Conductor"
            value={conductorId}
            onChange={(e) => onChangeConductor(Number(e.target.value))}
          >
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Form.Select>
        </div>
      </RoleHead>

      <h3 className="section-title">Viajes asignados</h3>
      {misViajes.length === 0 ? (
        <div className="empty">No tienes viajes asignados en este momento.</div>
      ) : (
        <Row xs={1} md={2} xl={3} className="g-3">
          {misViajes.map((t) => {
            const cliente = clientes.find((c) => c.id === t.clienteId)
            const siguiente =
              t.estado === "Asignado"
                ? { label: "Iniciar viaje (marcar en tránsito)", to: "En tránsito" }
                : { label: "Marcar como entregado", to: "Entregado" }
            return (
              <Col key={t.id}>
                <div className="driver-card h-100">
                  <Badge clase={ESTADO_INFO[t.estado].clase}>{t.estado}</Badge>
                  <div className="tt-route">
                    {t.origen} → {t.destino}
                  </div>
                  <div className="tt-meta">
                    {t.id} · {cliente?.nombre} · Vehículo {t.vehiculo} · {t.kmEstimado} km
                  </div>
                  <div className="tt-meta">Carga: {t.carga}</div>
                  {t.estado === "En tránsito" && (
                    <div className="tt-meta mt-2">
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
                  <div className="d-grid gap-2 mt-3">
                    <Button size="lg" onClick={() => avanzarViaje(t.id, siguiente.to)}>
                      {siguiente.label}
                    </Button>
                    {t.estado === "En tránsito" && (
                      <Button variant="azul" size="lg" onClick={() => setModal({ tipo: "ubicacion", tripId: t.id })}>
                        Actualizar mi ubicación
                      </Button>
                    )}
                    <Button
                      variant="outline-light"
                      size="lg"
                      onClick={() => setModal({ tipo: "novedad", tripId: t.id })}
                    >
                      Reportar novedad
                    </Button>
                    <Button
                      variant="outline-light"
                      size="lg"
                      onClick={() => setModal({ tipo: "combustible", tripId: t.id })}
                    >
                      Registrar carga de combustible
                    </Button>
                  </div>
                </div>
              </Col>
            )
          })}
        </Row>
      )}

      <Row className="g-4 mt-1">
        <Col lg={6}>
          <h3 className="section-title mt-0">Historial reciente</h3>
          {historial.length === 0 ? (
            <div className="empty">Sin viajes completados aún.</div>
          ) : (
            <Card>
              <Card.Body>
                <Table responsive hover size="sm" className="align-middle mb-0">
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
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
        <Col lg={6}>
          <h3 className="section-title mt-0">Combustible cargado por mí</h3>
          {misCargas.length === 0 ? (
            <div className="empty">Aún no registras cargas de combustible.</div>
          ) : (
            <Card>
              <Card.Body>
                <Table responsive hover size="sm" className="align-middle mb-0">
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
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

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

export default ConductorView
