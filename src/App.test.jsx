import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import App from "./App"
import { FleetProvider } from "./context/FleetProvider"

const renderApp = () =>
  render(
    <FleetProvider>
      <App />
    </FleetProvider>
  )

describe("App", () => {
  it("inicia en el portal del cliente", () => {
    renderApp()

    expect(screen.getByRole("heading", { name: "Portal del cliente" })).toBeInTheDocument()
  })

  it("cambia de vista al elegir cada rol en el menú lateral", async () => {
    const user = userEvent.setup()
    renderApp()
    const rutas = [
      ["Conductor", "App del conductor"],
      ["Supervisor de ruta", "Tablero de despacho"],
      ["Jefe de flota", "Panorama de flota"],
      ["Mantenimiento", "Mantenimiento de flota"],
      ["Administrador", "Reportes de gestión"],
      ["Cliente", "Portal del cliente"],
    ]

    for (const [boton, titulo] of rutas) {
      await user.click(screen.getByRole("button", { name: boton }))
      expect(screen.getByRole("heading", { name: titulo })).toBeInTheDocument()
    }
  })

  it("muestra un aviso al solicitar un viaje", async () => {
    const user = userEvent.setup()
    renderApp()

    await user.type(screen.getByLabelText(/Origen/), "Santiago")
    await user.type(screen.getByLabelText(/Destino/), "Concepción")
    await user.type(screen.getByLabelText(/Descripción de la carga/), "Repuestos")
    await user.click(screen.getByRole("button", { name: "Solicitar viaje" }))

    expect(await screen.findByText("Solicitud de viaje enviada.")).toBeVisible()
  })

  it("el supervisor asigna un viaje y el conductor lo ve en su app", async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole("button", { name: "Supervisor de ruta" }))
    await user.click(screen.getByRole("button", { name: "Asignar" }))
    await user.click(screen.getByRole("button", { name: "Conductor" }))

    expect(screen.getAllByRole("button", { name: "Iniciar viaje (marcar en tránsito)" })).toHaveLength(2)
  })
})
