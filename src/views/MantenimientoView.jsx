import { useState } from "react"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { KM_INTERVALO_MANTENCION } from "../data/constants"
import { fmtNum } from "../utils/format"

export default function MantenimientoView() {
  const { vehiculos, maintenance, registrarMantencion, cerrarMantencion } = useFleet()

  const formVacio = { vehiculo: vehiculos[0]?.patente ?? "", tipo: "Preventivo", detalle: "", fecha: "" }
  const [form, setForm] = useState(formVacio)
  const [faltantes, setFaltantes] = useState([])

  const alertas = vehiculos.filter((v) => v.km - v.kmUltMant >= KM_INTERVALO_MANTENCION)

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))
  const errorClass = (name) => (faltantes.some((f) => f.name === name) ? "input-error" : "")

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

      <h3 className="section-title">Alertas automáticas</h3>
      {alertas.length === 0 ? (
        <div className="empty">
          No hay vehículos que superen el intervalo de mantención preventiva ({fmtNum(KM_INTERVALO_MANTENCION)} km).
        </div>
      ) : (
        alertas.map((v) => (
          <div key={v.patente} className="alert">
            <span>
              <b>{v.patente}</b> — acumula {fmtNum(v.km - v.kmUltMant)} km desde su última mantención. Se recomienda
              programar revisión preventiva.
            </span>
          </div>
        ))
      )}

      <div className="two-col">
        <div className="card">
          <h3>Registrar mantención</h3>
          <form onSubmit={enviar} noValidate>
            <label htmlFor="m-vehiculo">
              Vehículo <span className="req">*</span>
            </label>
            <select
              id="m-vehiculo"
              className={errorClass("vehiculo")}
              value={form.vehiculo}
              onChange={set("vehiculo")}
              required
            >
              {vehiculos.map((v) => (
                <option key={v.patente} value={v.patente}>
                  {v.patente} — {v.marca} {v.modelo}
                </option>
              ))}
            </select>

            <label htmlFor="m-tipo">
              Tipo <span className="req">*</span>
            </label>
            <select id="m-tipo" className={errorClass("tipo")} value={form.tipo} onChange={set("tipo")} required>
              <option>Preventivo</option>
              <option>Correctivo</option>
            </select>

            <label htmlFor="m-detalle">
              Detalle <span className="req">*</span>
            </label>
            <input
              id="m-detalle"
              className={errorClass("detalle")}
              value={form.detalle}
              onChange={set("detalle")}
              placeholder="Ej: Cambio de neumáticos"
              required
            />

            <label htmlFor="m-fecha">
              Fecha programada <span className="req">*</span>
            </label>
            <input
              id="m-fecha"
              className={errorClass("fecha")}
              type="date"
              value={form.fecha}
              onChange={set("fecha")}
              required
            />

            <p className="small muted" style={{ marginTop: "0.5rem" }}>
              <span className="req">*</span> Todos los campos son obligatorios para registrar la mantención.
            </p>

            {faltantes.length > 0 && (
              <div className="form-error-box">
                <span>
                  Faltan datos obligatorios por completar: <b>{faltantes.map((f) => f.label).join(", ")}</b>.
                </span>
              </div>
            )}

            <div style={{ marginTop: "1rem" }}>
              <button className="btn big" type="submit">
                Guardar y actualizar disponibilidad
              </button>
            </div>
          </form>
          <p className="small muted" style={{ marginTop: "0.6rem" }}>
            Al registrar una mantención, el vehículo pasa automáticamente a estado "En mantenimiento" y deja de estar
            disponible para el supervisor de ruta.
          </p>
        </div>

        <div className="card">
          <h3>Historial de mantenciones</h3>
          <table>
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
                        <button
                          className="btn ghost"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          onClick={() => cerrarMantencion(m.id)}
                        >
                          Marcar terminada
                        </button>
                      ) : (
                        <Badge clase={m.estado === "Terminada" ? "b-disponible" : "b-mantenimiento"}>{m.estado}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
