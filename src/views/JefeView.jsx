import { Card, Col, Row, Table } from "react-bootstrap"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { KM_INTERVALO_MANTENCION, estadoVehiculoClase } from "../data/constants"
import { fmtNum } from "../utils/format"

function JefeView() {
  const { vehiculos, conductores, trips, maintenance } = useFleet()

  const totalVeh = vehiculos.length
  const enViaje = trips.filter((t) => t.estado === "En tránsito").length
  const utilizacion = Math.round((enViaje / totalVeh) * 100)
  const disponibles = vehiculos.filter((v) => v.estado === "Disponible").length
  const enMant = vehiculos.filter((v) => v.estado !== "Disponible").length
  const entregados = trips.filter((t) => t.estado === "Entregado")
  const retrasados = entregados.filter((t) => t.retrasado).length
  const pctRetraso = entregados.length ? Math.round((retrasados / entregados.length) * 100) : 0
  const maxViajes = Math.max(...conductores.map((c) => c.viajesCompletados), 1)
  const fallasEnCurso = maintenance.filter((m) => m.tipo === "Correctivo" && m.estado === "En curso").length

  return (
    <>
      <RoleHead
        title="Panorama de flota"
        description="Disponibilidad, utilización y rendimiento de vehículos y conductores en un solo lugar."
      />

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col>
          <Card body className="kpi up h-100">
            <div className="num">
              {disponibles}/{totalVeh}
            </div>
            <div className="lbl">Vehículos disponibles ahora</div>
          </Card>
        </Col>
        <Col>
          <Card body className="kpi h-100">
            <div className="num">{enMant}</div>
            <div className="lbl">En mantenimiento o taller</div>
          </Card>
        </Col>
        <Col>
          <Card body className={`kpi h-100 ${pctRetraso > 15 ? "down" : ""}`}>
            <div className="num">{pctRetraso}%</div>
            <div className="lbl">
              Viajes entregados con retraso ({retrasados}/{entregados.length})
            </div>
          </Card>
        </Col>
        <Col>
          <Card body className="kpi down h-100">
            <div className="num">{fallasEnCurso}</div>
            <div className="lbl">Fallas correctivas en curso</div>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h3">Utilización de la flota</Card.Title>
              <div className="donut" style={{ "--pct": utilizacion }}>
                <div className="donut-inner">
                  <div className="num">{utilizacion}%</div>
                  <div className="lbl">en tránsito ahora</div>
                </div>
              </div>
              <p className="small text-secondary text-center mt-3 mb-0">
                Vehículos en ruta sobre el total de la flota. La meta del proyecto es superar el 70% histórico con
                asignación optimizada.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h3">Rendimiento por conductor</Card.Title>
              <div className="bars">
                {conductores.map((c) => (
                  <div key={c.id} className="bar-row">
                    <span>{c.nombre.split(" ")[0]}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${((c.viajesCompletados / maxViajes) * 100).toFixed(0)}%` }}
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

      <h3 className="section-title">Estado de la flota</h3>
      <Card>
        <Card.Body>
          <Table responsive hover size="sm" className="align-middle mb-0">
            <thead>
              <tr>
                <th>Patente</th>
                <th>Marca / modelo</th>
                <th>Kilometraje</th>
                <th>Próxima mantención</th>
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
                  <td>{fmtNum(v.km)} km</td>
                  <td>{fmtNum(v.kmUltMant + KM_INTERVALO_MANTENCION)} km</td>
                  <td>
                    <Badge clase={estadoVehiculoClase(v.estado)}>{v.estado}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  )
}

export default JefeView
