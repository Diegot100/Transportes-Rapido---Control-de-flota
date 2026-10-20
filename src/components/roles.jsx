import { useState } from "react"
import Modal from "./Modal"
import { fmtCLP } from "../utils/format"

export function TextPromptModal({ title, label, placeholder, submitLabel, onSubmit, onClose }) {
  const [valor, setValor] = useState("")
  const enviar = (e) => {
    e.preventDefault()
    if (!valor.trim()) return
    onSubmit(valor.trim())
    onClose()
  }
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={enviar}>
        <label>{label}</label>
        <input autoFocus value={valor} onChange={(e) => setValor(e.target.value)} placeholder={placeholder} />
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn" disabled={!valor.trim()}>
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function CombustibleModal({ onSubmit, onClose }) {
  const [litros, setLitros] = useState("80")
  const [costo, setCosto] = useState("")
  const costoSugerido = (Number(litros) || 0) * 1200
  const costoFinal = costo === "" ? costoSugerido : Number(costo)

  const enviar = (e) => {
    e.preventDefault()
    if (!Number(litros) || !costoFinal) return
    onSubmit(Number(litros), costoFinal)
    onClose()
  }

  return (
    <Modal title="Registrar carga de combustible" onClose={onClose}>
      <form onSubmit={enviar}>
        <label>Litros cargados</label>
        <input autoFocus type="number" min="1" value={litros} onChange={(e) => setLitros(e.target.value)} />
        <label>Costo total (CLP)</label>
        <input
          type="number"
          min="1"
          value={costo === "" ? costoSugerido : costo}
          onChange={(e) => setCosto(e.target.value)}
        />
        <p className="small muted" style={{ marginTop: "0.4rem" }}>
          Sugerido: {fmtCLP(costoSugerido)} (a $1.200 por litro). Puedes editarlo.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn" disabled={!Number(litros) || !costoFinal}>
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function NovedadesModal({ trip, onClose }) {
  return (
    <Modal title={`Novedades · ${trip.id}`} onClose={onClose}>
      {trip.novedades.length === 0 ? (
        <p className="muted small">Sin novedades reportadas para este viaje.</p>
      ) : (
        <ol className="modal-list">
          {trip.novedades.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ol>
      )}
      <div className="modal-actions">
        <button className="btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  )
}
