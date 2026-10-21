import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { KM_INTERVALO_MANTENCION, estadoVehiculoClase } from "../data/constants"
import { fmtNum } from "../utils/format"

export default function JefeView() {
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

      <div className="grid grid-4" style={{ marginBottom: "1.2rem" }}>
        <div className="card kpi up">
          <div className="num">
            {disponibles}/{totalVeh}
          </div>
          <div className="lbl">Vehículos disponibles ahora</div>
        </div>
        <div className="card kpi">
          <div className="num">{enMant}</div>
          <div className="lbl">En mantenimiento o taller</div>
        </div>
        <div className={`card kpi ${pctRetraso > 15 ? "down" : ""}`}>
          <div className="num">{pctRetraso}%</div>
          <div className="lbl">
            Viajes entregados con retraso ({retrasados}/{entregados.length})
          </div>
        </div>
        <div className="card kpi down">
          <div className="num">{fallasEnCurso}</div>
          <div className="lbl">Fallas correctivas en curso</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Utilización de la flota</h3>
          <div className="donut" style={{ "--pct": utilizacion }}>
            <div className="donut-inner">
              <div className="num">{utilizacion}%</div>
              <div className="lbl">en tránsito ahora</div>
            </div>
          </div>
          <p className="small muted" style={{ textAlign: "center", marginTop: "0.7rem" }}>
            Vehículos en ruta sobre el total de la flota. La meta del proyecto es superar el 70% histórico con
            asignación optimizada.
          </p>
        </div>
        <div className="card">
          <h3>Rendimiento por conductor</h3>
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
        </div>
      </div>

      <h3 className="section-title">Estado de la flota</h3>
      <table>
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
      </table>
    </>
  )
}
