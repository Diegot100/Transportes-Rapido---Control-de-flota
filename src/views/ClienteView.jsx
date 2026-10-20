import { useMemo, useState } from "react"
import { useFleet } from "../context/useFleet"
import RoleHead from "../components/RoleHead"
import Badge from "../components/Badge"
import { ESTADO_INFO, ESTADO_ORDEN, SERVICE_TYPES } from "../data/constants"
import { estimarKm } from "../utils/distancia"
import { fmtCLP } from "../utils/format"

const FORM_VACIO = { origen: "", destino: "", servicio: SERVICE_TYPES[0].codigo, carga: "" }

export default function ClienteView({ clienteId, onChangeCliente }) {
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
  const errorClass = (name) => (faltantes.some((f) => f.name === name) ? "input-error" : "")

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
        <div className="as-select">
          Viendo como
          <select aria-label="Cliente" value={clienteId} onChange={(e) => onChangeCliente(Number(e.target.value))}>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </RoleHead>

      <div className="two-col">
        <div className="card">
          <h3>Solicitar viaje</h3>
          <form onSubmit={enviar} noValidate>
            <label htmlFor="origen">
              Origen <span className="req">*</span>
            </label>
            <input
              id="origen"
              className={errorClass("origen")}
              value={form.origen}
              onChange={set("origen")}
              placeholder="Ej: Santiago"
              required
            />

            <label htmlFor="destino">
              Destino <span className="req">*</span>
            </label>
            <input
              id="destino"
              className={errorClass("destino")}
              value={form.destino}
              onChange={set("destino")}
              placeholder="Ej: Puerto Montt"
              required
            />

            <label htmlFor="servicio">
              Tipo de servicio <span className="req">*</span>
            </label>
            <select
              id="servicio"
              className={errorClass("servicio")}
              value={form.servicio}
              onChange={set("servicio")}
              required
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s.codigo} value={s.codigo}>
                  {s.nombre} — {fmtCLP(s.base)} base + {fmtCLP(s.km)}/km
                </option>
              ))}
            </select>

            <label htmlFor="carga">
              Descripción de la carga <span className="req">*</span>
            </label>
            <textarea
              id="carga"
              className={errorClass("carga")}
              value={form.carga}
              onChange={set("carga")}
              placeholder="Ej: 12 pallets de abarrotes, sin refrigeración"
              required
            />

            <label htmlFor="km">
              Distancia estimada (km) <span className="req">*</span>
            </label>
            <input
              id="km"
              className={`input-readonly ${errorClass("km")}`}
              type="number"
              value={km}
              readOnly
              required
              placeholder="Se calcula al ingresar origen y destino"
            />
            <p className="small muted" style={{ marginTop: "0.3rem" }}>
              Se calcula automáticamente a partir de la comuna/ciudad de origen y destino que escribas. No es editable.
            </p>

            <label>Costo estimado</label>
            <div className="costo-estimado">{fmtCLP(costoEstimado)}</div>
            <p className="small muted" style={{ marginTop: "0.3rem" }}>
              Tarifa base del servicio elegido más el valor por km, multiplicado por la distancia estimada.
            </p>
            <p className="small muted" style={{ marginTop: "0.5rem" }}>
              <span className="req">*</span> Todos los campos son obligatorios para solicitar el viaje.
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
                Solicitar viaje
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Costo estimado del servicio</h3>
          <p className="muted small">
            El costo se calcula como tarifa base más un valor por kilómetro, según el tipo de servicio elegido.
          </p>
          <table>
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
          </table>
        </div>
      </div>

      <h3 className="section-title">Mis viajes</h3>
      {misViajes.length === 0 ? (
        <div className="empty">Aún no tienes viajes solicitados.</div>
      ) : (
        misViajes.map((t) => <TripCardCliente key={t.id} trip={t} />)
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
    <div className="card" style={{ marginBottom: "0.8rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h4>
            {t.id} · {t.origen} → {t.destino}
          </h4>
          <p className="small muted" style={{ margin: 0 }}>
            {t.carga} · {fmtCLP(t.costo)} · {t.kmEstimado} km
          </p>
        </div>
        <Badge clase={info.clase}>{t.estado}</Badge>
      </div>

      <p className="small" style={{ marginTop: "0.5rem" }}>
        {info.cliente}
      </p>

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
        <p className="small muted">
          Vehículo asignado: {t.vehiculo} {cond ? "· Conductor: " + cond.nombre : ""}
        </p>
      )}

      {t.estado === "En tránsito" &&
        (t.ubicacion ? (
          <p className="small" style={{ color: "var(--blue)" }}>
            📍 Última ubicación: <strong>{t.ubicacion}</strong>{" "}
            <span className="muted">(actualizado {t.ubicacionFecha})</span>
          </p>
        ) : (
          <p className="small muted">📍 Aún sin reporte de ubicación del conductor.</p>
        ))}

      {t.novedades.length > 0 && (
        <p className="small" style={{ color: "var(--warn)" }}>
          Última novedad: {t.novedades[t.novedades.length - 1]}
        </p>
      )}

      {t.retrasado && (
        <p className="small" style={{ color: "var(--danger)" }}>
          ⚠ Este viaje se entregó con retraso respecto a lo estimado.
        </p>
      )}

      {t.estado === "Entregado" && (
        <div className="flag">
          <span className="dot" />
          Puedes calificar este servicio.
        </div>
      )}
    </div>
  )
}
