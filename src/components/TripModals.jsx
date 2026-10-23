import { useState } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { fmtCLP } from "../utils/format"

function Cabecera({ titulo }) {
  return (
    <Modal.Header closeButton>
      <Modal.Title as="h3" className="h5" id="modal-titulo">
        {titulo}
      </Modal.Title>
    </Modal.Header>
  )
}

export function TextPromptModal({ title, label, placeholder, submitLabel, onSubmit, onClose }) {
  const [valor, setValor] = useState("")

  const enviar = (e) => {
    e.preventDefault()
    if (!valor.trim()) return
    onSubmit(valor.trim())
    onClose()
  }

  return (
    <Modal show onHide={onClose} centered aria-labelledby="modal-titulo">
      <Cabecera titulo={title} />
      <Form onSubmit={enviar}>
        <Modal.Body>
          <Form.Group controlId="texto-modal">
            <Form.Label>{label}</Form.Label>
            <Form.Control
              autoFocus
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={placeholder}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!valor.trim()}>
            {submitLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export function CombustibleModal({ onSubmit, onClose }) {
  const [litros, setLitros] = useState("80")
  const [costo, setCosto] = useState("")
  const [costoEditado, setCostoEditado] = useState(false)
  const costoSugerido = (Number(litros) || 0) * 1200
  const costoMostrado = costoEditado ? costo : costoSugerido
  const costoFinal = Number(costoMostrado)

  const enviar = (e) => {
    e.preventDefault()
    if (!Number(litros) || !costoFinal) return
    onSubmit(Number(litros), costoFinal)
    onClose()
  }

  return (
    <Modal show onHide={onClose} centered aria-labelledby="modal-titulo">
      <Cabecera titulo="Registrar carga de combustible" />
      <Form onSubmit={enviar}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="litros-modal">
            <Form.Label>Litros cargados</Form.Label>
            <Form.Control autoFocus type="number" min="1" value={litros} onChange={(e) => setLitros(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="costo-modal">
            <Form.Label>Costo total (CLP)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={costoMostrado}
              onChange={(e) => {
                setCosto(e.target.value)
                setCostoEditado(true)
              }}
            />
            <Form.Text muted>Sugerido: {fmtCLP(costoSugerido)} (a $1.200 por litro). Puedes editarlo.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!Number(litros) || !costoFinal}>
            Registrar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export function NovedadesModal({ trip, onClose }) {
  return (
    <Modal show onHide={onClose} centered aria-labelledby="modal-titulo">
      <Cabecera titulo={`Novedades · ${trip.id}`} />
      <Modal.Body>
        {trip.novedades.length === 0 ? (
          <p className="text-secondary small mb-0">Sin novedades reportadas para este viaje.</p>
        ) : (
          <ol className="small mb-0">
            {trip.novedades.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ol>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  )
}
