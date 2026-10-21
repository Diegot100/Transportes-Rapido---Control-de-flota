import { Card, Col, Row, Table } from "react-bootstrap"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { ESTADO_INFO, SERVICE_TYPES } from "../data/constants"
import { fmtCLP, fmtNum } from "../utils/format"

const KM_POR_LITRO = 3.2

function AdminView() {
  const { trips, conductores, clientes, fuelLogs } = useFleet()

  const activos = trips.filter((t) => t.estado !== "Cancelado")
  const costoTotal = activos.reduce((s, t) => s + t.costo, 0)
  const kmTotal = activos.reduce((s, t) => s + t.kmEstimado, 0)
  const consumoEstimado = Math.round(kmTotal / KM_POR_LITRO)
  const litrosReales = fuelLogs.reduce((s, f) => s + f.litros, 0)
  const costoCombustibleReal = fuelLogs.reduce((s, f) => s + f.costo, 0)

  const porServicio = SERVICE_TYPES.map((s) => ({
    ...s,
    cantidad: trips.filter((t) => t.servicio === s.codigo && t.estado !== "Cancelado").length,
  }))
  const maxServ = Math.max(...porServicio.map((s) => s.cantidad), 1)
  const porConductor = conductores.slice().sort((a, b) => b.viajesCompletados - a.viajesCompletados)
  const maxCond = Math.max(...porConductor.map((c) => c.viajesCompletados), 1)

  return (
    <>
      <RoleHead
        title="Reportes de gestión"
        description="Utilización de flota, costos operativos, consumo de combustible y productividad de conductores, generados automáticamente."
      />

      <Row xs={1} md={3} className="g-3 mb-3">
        <Col>
          <Card body className="kpi h-100">
            <div className="num">{fmtCLP(costoTotal)}</div>
            <div className="lbl">Costo operativo acumulado (viajes activos)</div>
          </Card>
        </Col>
        <Col>
          <Card body className="kpi h-100">
            <div className="num">{fmtNum(kmTotal)} km</div>
            <div className="lbl">Kilómetros recorridos (viajes activos)</div>
          </Card>
        </Col>
        <Col>
          <Card body className="kpi h-100">
            <div className="num">{fmtNum(litrosReales)} L</div>
            <div className="lbl">Combustible real registrado por conductores</div>
          </Card>
        </Col>
      </Row>

      <Card body className="small text-secondary mb-4">
        Estimado por rendimiento (3,2 km/l): <strong>{fmtNum(consumoEstimado)} L</strong> · Costo real de combustible
        registrado: <strong>{fmtCLP(costoCombustibleReal)}</strong>{" "}
        {litrosReales > 0 ? (
          <>
            · Diferencia vs. estimado: <strong>{fmtNum(litrosReales - consumoEstimado)} L</strong>
          </>
        ) : (
          "· aún no hay cargas registradas por conductores."
        )}
      </Card>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h3">Viajes por tipo de servicio</Card.Title>
              <div className="bars">
                {porServicio.map((s) => (
                  <div key={s.codigo} className="bar-row">
                    <span>{s.nombre}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill accent"
                        style={{ width: `${((s.cantidad / maxServ) * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <span>{s.cantidad}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h3">Productividad de conductores</Card.Title>
              <div className="bars">
                {porConductor.map((c) => (
                  <div key={c.id} className="bar-row">
                    <span>{c.nombre.split(" ")[0]}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${((c.viajesCompletados / maxCond) * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <span>{c.viajesCompletados}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="section-title">Detalle de viajes</h3>
      <Card>
        <Card.Body>
          <Table responsive hover size="sm" className="align-middle mb-0">
            <thead>
              <tr>
                <th>Viaje</th>
                <th>Cliente</th>
                <th>Ruta</th>
                <th>Servicio</th>
                <th>Costo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {trips
                .slice()
                .reverse()
                .map((t) => {
                  const cli = clientes.find((c) => c.id === t.clienteId)
                  const serv = SERVICE_TYPES.find((s) => s.codigo === t.servicio)
                  return (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{cli?.nombre}</td>
                      <td>
                        {t.origen} → {t.destino}
                      </td>
                      <td>{serv?.nombre}</td>
                      <td>{fmtCLP(t.costo)}</td>
                      <td>
                        <Badge clase={ESTADO_INFO[t.estado].clase}>{t.estado}</Badge>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <h3 className="section-title">Detalle de cargas de combustible</h3>
      {fuelLogs.length === 0 ? (
        <div className="empty">Aún no hay cargas de combustible registradas por conductores.</div>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover size="sm" className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Registro</th>
                  <th>Vehículo</th>
                  <th>Conductor</th>
                  <th>Litros</th>
                  <th>Costo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs
                  .slice()
                  .reverse()
                  .map((f) => {
                    const cond = conductores.find((c) => c.id === f.conductorId)
                    return (
                      <tr key={f.id}>
                        <td>{f.id}</td>
                        <td>{f.patente}</td>
                        <td>{cond?.nombre}</td>
                        <td>{f.litros} L</td>
                        <td>{fmtCLP(f.costo)}</td>
                        <td>{f.fecha}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </>
  )
}

export default AdminView
