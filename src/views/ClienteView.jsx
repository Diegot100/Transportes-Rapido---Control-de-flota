import { useMemo, useState } from "react"
import { Alert, Button, Card, Col, Form, Row, Table } from "react-bootstrap"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { ESTADO_INFO, ESTADO_ORDEN, SERVICE_TYPES } from "../data/constants"
import { estimarKm } from "../utils/distancia"
import { fmtCLP } from "../utils/format"

const FORM_VACIO = { origen: "", destino: "", servicio: SERVICE_TYPES[0].codigo, carga: "" }

function ClienteView({ clienteId, onChangeCliente }) {
  const { clientes, trips, solicitarViaje } = useFleet()
  const [form, setForm] = useState(FORM_VACIO)
  const [faltantes, setFaltantes] = useState([])

  const km = useMemo(
    () => (form.origen.trim() || form.destino.trim() ? estimarKm(form.origen, form.destino) : ""),
    [form.origen, form.destino]
  )
  const servicio = SERVICE_TYPES.find((s) => s.codigo === form.servicio)
  const costoEstimado = servicio ? servicio.base + servicio.km * (Number(km) || 0) : 0

  const misViajes = trips.filter((t) => t.clienteId === clienteId).sort((a, b) => b.id.localeCompare(a.id))

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))
  const invalido = (name) => faltantes.some((f) => f.name === name)

  const enviar = (e) => {
    e.preventDefault()
    const campos = [
      { name: "origen", label: "Origen", valor: form.origen },
      { name: "destino", label: "Destino", valor: form.destino },
      { name: "servicio", label: "Tipo de servicio", valor: form.servicio },
      { name: "carga", label: "Descripción de la carga", valor: form.carga },
      { name: "km", label: "Distancia estimada (revisa que origen y destino estén reconocidos)", valor: String(km) },
    ]
    const faltan = campos.filter((c) => !c.valor.trim())
    setFaltantes(faltan)
    if (faltan.length) return

    solicitarViaje({
      clienteId,
      origen: form.origen,
      destino: form.destino,
      servicio: form.servicio,
      carga: form.carga,
      kmEstimado: Number(km),
    })
    setForm(FORM_VACIO)
  }

  return (
    <>
      <RoleHead
        title="Portal del cliente"
        description="Solicita un viaje y sigue el estado de tu carga. Solo ves la información de tus propios viajes."
      >
        <div className="d-flex align-items-center gap-2 small text-secondary">
          <span>Viendo como</span>
          <Form.Select
            size="sm"
            className="w-auto"
            aria-label="Cliente"
            value={clienteId}
            onChange={(e) => onChangeCliente(Number(e.target.value))}
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Form.Select>
        </div>
      </RoleHead>

      <Row className="g-4">
        <Col lg={7}>
          <Card>
            <Card.Body>
              <Card.Title as="h3">Solicitar viaje</Card.Title>
              <Form onSubmit={enviar} noValidate>
                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Group controlId="origen">
                      <Form.Label>
                        Origen <span className="text-danger fw-bold">*</span>
                      </Form.Label>
                      <Form.Control
                        value={form.origen}
                        onChange={set("origen")}
                        placeholder="Ej: Santiago"
                        isInvalid={invalido("origen")}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group controlId="destino">
                      <Form.Label>
                        Destino <span className="text-danger fw-bold">*</span>
                      </Form.Label>
                      <Form.Control
                        value={form.destino}
                        onChange={set("destino")}
                        placeholder="Ej: Puerto Montt"
                        isInvalid={invalido("destino")}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group controlId="servicio">
                      <Form.Label>
                        Tipo de servicio <span className="text-danger fw-bold">*</span>
                      </Form.Label>
                      <Form.Select value={form.servicio} onChange={set("servicio")} isInvalid={invalido("servicio")}>
                        {SERVICE_TYPES.map((s) => (
                          <option key={s.codigo} value={s.codigo}>
                            {s.nombre} — {fmtCLP(s.base)} base + {fmtCLP(s.km)}/km
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group controlId="carga">
                      <Form.Label>
                        Descripción de la carga <span className="text-danger fw-bold">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={form.carga}
                        onChange={set("carga")}
                        placeholder="Ej: 12 pallets de abarrotes, sin refrigeración"
                        isInvalid={invalido("carga")}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group controlId="km">
                      <Form.Label>
                        Distancia estimada (km) <span className="text-danger fw-bold">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        className="input-readonly"
                        value={km}
                        readOnly
                        placeholder="Se calcula al ingresar origen y destino"
                        isInvalid={invalido("km")}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Label as="div">Costo estimado</Form.Label>
                    <div className="costo-estimado">{fmtCLP(costoEstimado)}</div>
                  </Col>
                </Row>
                <p className="small text-secondary mt-3 mb-2">
                  La distancia se calcula automáticamente a partir de la comuna o ciudad de origen y destino. El costo
                  es la tarifa base del servicio más el valor por km.
                </p>
                <p className="small text-secondary mb-3">
                  <span className="text-danger fw-bold">*</span> Todos los campos son obligatorios para solicitar el
                  viaje.
                </p>

                {faltantes.length > 0 && (
                  <Alert variant="danger" className="py-2 small">
                    Faltan datos obligatorios por completar: <b>{faltantes.map((f) => f.label).join(", ")}</b>.
                  </Alert>
                )}

                <Button type="submit" size="lg" className="w-100">
                  Solicitar viaje
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Body>
              <Card.Title as="h3">Costo estimado del servicio</Card.Title>
              <p className="text-secondary small">
                El costo se calcula como tarifa base más un valor por kilómetro, según el tipo de servicio elegido.
              </p>
              <Table responsive size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Base</th>
                    <th>Por km</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICE_TYPES.map((s) => (
                    <tr key={s.codigo}>
                      <td>{s.nombre}</td>
                      <td>{fmtCLP(s.base)}</td>
                      <td>{fmtCLP(s.km)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="section-title">Mis viajes</h3>
      {misViajes.length === 0 ? (
        <div className="empty">Aún no tienes viajes solicitados.</div>
      ) : (
        <Row xs={1} xl={2} className="g-3">
          {misViajes.map((t) => (
            <Col key={t.id}>
              <TripCardCliente trip={t} />
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}

function TripCardCliente({ trip: t }) {
  const { conductores } = useFleet()
  const info = ESTADO_INFO[t.estado]
  const idxActual = ESTADO_ORDEN.indexOf(t.estado)
  const cond = conductores.find((c) => c.id === t.conductorId)

  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between flex-wrap gap-2">
          <div>
            <h4 className="h6 mb-1">
              {t.id} · {t.origen} → {t.destino}
            </h4>
            <p className="small text-secondary mb-0">
              {t.carga} · {fmtCLP(t.costo)} · {t.kmEstimado} km
            </p>
          </div>
          <div>
            <Badge clase={info.clase}>{t.estado}</Badge>
          </div>
        </div>

        <p className="small mt-2 mb-0">{info.cliente}</p>

        {t.estado !== "Cancelado" && (
          <div className="timeline">
            {ESTADO_ORDEN.map((e, i) => (
              <div key={e} className={`tl-step ${i < idxActual ? "done" : ""} ${i === idxActual ? "current" : ""}`}>
                <div className="tl-dot" />
                <div className="tl-label">{e}</div>
              </div>
            ))}
          </div>
        )}

        {t.vehiculo && (
          <p className="small text-secondary mb-1">
            Vehículo asignado: {t.vehiculo} {cond ? "· Conductor: " + cond.nombre : ""}
          </p>
        )}

        {t.estado === "En tránsito" &&
          (t.ubicacion ? (
            <p className="small text-primary mb-1">
              📍 Última ubicación: <strong>{t.ubicacion}</strong>{" "}
              <span className="text-secondary">(actualizado {t.ubicacionFecha})</span>
            </p>
          ) : (
            <p className="small text-secondary mb-1">📍 Aún sin reporte de ubicación del conductor.</p>
          ))}

        {t.novedades.length > 0 && (
          <p className="small text-warning-emphasis mb-1">Última novedad: {t.novedades[t.novedades.length - 1]}</p>
        )}

        {t.retrasado && (
          <p className="small text-danger mb-1">⚠ Este viaje se entregó con retraso respecto a lo estimado.</p>
        )}

        {t.estado === "Entregado" && (
          <div className="flag">
            <span className="dot" />
            Puedes calificar este servicio.
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default ClienteView
