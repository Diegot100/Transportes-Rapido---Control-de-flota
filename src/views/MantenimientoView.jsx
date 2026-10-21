import { useState } from "react"
import { Alert, Button, Card, Col, Form, Row, Table } from "react-bootstrap"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { KM_INTERVALO_MANTENCION } from "../data/constants"
import { fmtNum } from "../utils/format"

function MantenimientoView() {
  const { vehiculos, maintenance, registrarMantencion, cerrarMantencion } = useFleet()

  const formVacio = { vehiculo: vehiculos[0]?.patente ?? "", tipo: "Preventivo", detalle: "", fecha: "" }
  const [form, setForm] = useState(formVacio)
  const [faltantes, setFaltantes] = useState([])

  const alertas = vehiculos.filter((v) => v.km - v.kmUltMant >= KM_INTERVALO_MANTENCION)

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))
  const invalido = (name) => faltantes.some((f) => f.name === name)

  const enviar = (e) => {
    e.preventDefault()
    const campos = [
      { name: "vehiculo", label: "Vehículo" },
      { name: "tipo", label: "Tipo" },
      { name: "detalle", label: "Detalle" },
      { name: "fecha", label: "Fecha programada" },
    ]
    const faltan = campos.filter((c) => !String(form[c.name]).trim())
    setFaltantes(faltan)
    if (faltan.length) return
    registrarMantencion(form)
    setForm(formVacio)
  }

  return (
    <>
      <RoleHead
        title="Mantenimiento de flota"
        description="Programa revisiones, registra intervenciones y recibe alertas automáticas por kilometraje, sincronizadas con la disponibilidad de la flota."
      />

      <h3 className="section-title mt-0">Alertas automáticas</h3>
      {alertas.length === 0 ? (
        <div className="empty">
          No hay vehículos que superen el intervalo de mantención preventiva ({fmtNum(KM_INTERVALO_MANTENCION)} km).
        </div>
      ) : (
        alertas.map((v) => (
          <Alert key={v.patente} variant="danger" className="py-2 small">
            <b>{v.patente}</b> — acumula {fmtNum(v.km - v.kmUltMant)} km desde su última mantención. Se recomienda
            programar revisión preventiva.
          </Alert>
        ))
      )}

      <Row className="g-4 mt-1">
        <Col lg={5}>
          <Card>
            <Card.Body>
              <Card.Title as="h3">Registrar mantención</Card.Title>
              <Form onSubmit={enviar} noValidate>
                <Form.Group className="mb-3" controlId="m-vehiculo">
                  <Form.Label>
                    Vehículo <span className="text-danger fw-bold">*</span>
                  </Form.Label>
                  <Form.Select value={form.vehiculo} onChange={set("vehiculo")} isInvalid={invalido("vehiculo")}>
                    {vehiculos.map((v) => (
                      <option key={v.patente} value={v.patente}>
                        {v.patente} — {v.marca} {v.modelo}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="m-tipo">
                  <Form.Label>
                    Tipo <span className="text-danger fw-bold">*</span>
                  </Form.Label>
                  <Form.Select value={form.tipo} onChange={set("tipo")} isInvalid={invalido("tipo")}>
                    <option>Preventivo</option>
                    <option>Correctivo</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="m-detalle">
                  <Form.Label>
                    Detalle <span className="text-danger fw-bold">*</span>
                  </Form.Label>
                  <Form.Control
                    value={form.detalle}
                    onChange={set("detalle")}
                    placeholder="Ej: Cambio de neumáticos"
                    isInvalid={invalido("detalle")}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="m-fecha">
                  <Form.Label>
                    Fecha programada <span className="text-danger fw-bold">*</span>
                  </Form.Label>
                  <Form.Control type="date" value={form.fecha} onChange={set("fecha")} isInvalid={invalido("fecha")} />
                </Form.Group>

                <p className="small text-secondary mb-3">
                  <span className="text-danger fw-bold">*</span> Todos los campos son obligatorios para registrar la
                  mantención.
                </p>

                {faltantes.length > 0 && (
                  <Alert variant="danger" className="py-2 small">
                    Faltan datos obligatorios por completar: <b>{faltantes.map((f) => f.label).join(", ")}</b>.
                  </Alert>
                )}

                <Button type="submit" size="lg" className="w-100">
                  Guardar y actualizar disponibilidad
                </Button>
              </Form>
              <p className="small text-secondary mt-3 mb-0">
                Al registrar una mantención, el vehículo pasa automáticamente a estado "En mantenimiento" y deja de
                estar disponible para el supervisor de ruta.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card>
            <Card.Body>
              <Card.Title as="h3">Historial de mantenciones</Card.Title>
              <Table responsive hover size="sm" className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Vehículo</th>
                    <th>Tipo</th>
                    <th>Detalle</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance
                    .slice()
                    .reverse()
                    .map((m) => (
                      <tr key={m.id}>
                        <td>{m.vehiculo}</td>
                        <td>{m.tipo}</td>
                        <td>{m.detalle}</td>
                        <td>{m.fecha}</td>
                        <td>
                          {m.estado === "En curso" ? (
                            <Button size="sm" variant="outline-secondary" onClick={() => cerrarMantencion(m.id)}>
                              Marcar terminada
                            </Button>
                          ) : (
                            <Badge clase={m.estado === "Terminada" ? "b-disponible" : "b-mantenimiento"}>
                              {m.estado}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default MantenimientoView
