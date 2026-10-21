import { useState } from "react"
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap"
import { ROLES } from "./roles.jsx"

function Sidebar({ currentRole, onChange }) {
  const [abierto, setAbierto] = useState(false)
  const actual = ROLES.find((r) => r.id === currentRole)

  const elegirDesdeMenu = (id) => {
    onChange(id)
    setAbierto(false)
  }

  return (
    <>
      <Navbar expand={false} data-bs-theme="dark" className="d-lg-none sticky-top mobile-nav">
        <Container fluid>
          <Navbar.Brand as="div" className="d-flex align-items-center gap-2 mb-0">
            <span className="side-mark">TR</span>
            <span className="fs-6">{actual.label}</span>
          </Navbar.Brand>
          <Navbar.Toggle label="Abrir menú" onClick={() => setAbierto(true)} />
        </Container>
      </Navbar>

      <Offcanvas show={abierto} onHide={() => setAbierto(false)} className="d-lg-none offcanvas-roles">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title as="h2" className="h5">
            Ruta Control
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column gap-1">
            {ROLES.map((r) => (
              <Nav.Link
                key={r.id}
                as="button"
                active={r.id === currentRole}
                className="role-link d-flex align-items-center gap-3 text-start"
                onClick={() => elegirDesdeMenu(r.id)}
              >
                <svg viewBox="0 0 24 24" className="role-ico">
                  {r.icon}
                </svg>
                {r.label}
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <aside className="sidebar d-none d-lg-flex">
        <div className="side-mark">TR</div>
        <nav className="side-nav" aria-label="Roles">
          {ROLES.map((r) => (
            <button
              key={r.id}
              className={r.id === currentRole ? "active" : ""}
              title={r.label}
              aria-label={r.label}
              onClick={() => onChange(r.id)}
            >
              <svg viewBox="0 0 24 24">{r.icon}</svg>
            </button>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
