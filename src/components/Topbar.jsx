import { Form, InputGroup } from "react-bootstrap"

function Topbar() {
  return (
    <header className="bg-white border-bottom px-3 px-lg-4 py-3 d-none d-md-flex align-items-center gap-3">
      <div>
        <h1 className="h5 mb-0">Ruta Control</h1>
        <small className="text-secondary d-none d-xl-block">Transportes Rápido — gestión de flota</small>
      </div>
      <InputGroup className="topbar-search ms-lg-3">
        <InputGroup.Text>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </InputGroup.Text>
        <Form.Control placeholder="Buscar viaje, patente o cliente..." aria-label="Buscar" disabled />
      </InputGroup>
      <div className="avatar ms-auto">TR</div>
    </header>
  )
}

export default Topbar
