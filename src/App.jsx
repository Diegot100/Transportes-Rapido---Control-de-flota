import { useState } from "react"
import { Container } from "react-bootstrap"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"
import Toast from "./components/Toast"
import { useFleet } from "./context/useFleet"
import ClienteView from "./views/ClienteView"
import ConductorView from "./views/ConductorView"
import SupervisorView from "./views/SupervisorView"
import JefeView from "./views/JefeView"
import MantenimientoView from "./views/MantenimientoView"
import AdminView from "./views/AdminView"

function App() {
  const { toast } = useFleet()
  const [role, setRole] = useState("cliente")
  const [clienteId, setClienteId] = useState(1)
  const [conductorId, setConductorId] = useState(1)

  const vistas = {
    cliente: <ClienteView clienteId={clienteId} onChangeCliente={setClienteId} />,
    conductor: <ConductorView conductorId={conductorId} onChangeConductor={setConductorId} />,
    supervisor: <SupervisorView />,
    jefe: <JefeView />,
    mantenimiento: <MantenimientoView />,
    admin: <AdminView />,
  }

  return (
    <>
      <div className="shell d-flex flex-column flex-lg-row">
        <Sidebar currentRole={role} onChange={setRole} />
        <div className="main flex-grow-1">
          <Topbar />
          <Container fluid="xl" className="py-4 pb-5">
            {vistas[role]}
          </Container>
        </div>
      </div>
      <Toast message={toast?.msg} />
    </>
  )
}

export default App