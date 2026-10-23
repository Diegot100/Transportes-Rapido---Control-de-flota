import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import AdminView from "./AdminView"
import ConductorView from "./ConductorView"
import { FleetProvider } from "../context/FleetProvider"

describe("AdminView", () => {
  it("suma el costo y los kilómetros de los viajes activos", () => {
    render(
      <FleetProvider>
        <AdminView />
      </FleetProvider>
    )

    expect(screen.getByText("$4.537.000")).toBeInTheDocument()
    expect(screen.getByText("1.338 km")).toBeInTheDocument()
  })

  it("compara el combustible estimado con el registrado", () => {
    render(
      <FleetProvider>
        <AdminView />
      </FleetProvider>
    )

    expect(screen.getByText("418 L")).toBeInTheDocument()
    expect(screen.getByText(/aún no hay cargas registradas por conductores/)).toBeInTheDocument()
  })

  it("lista todos los viajes, incluso los cancelados", () => {
    render(
      <FleetProvider>
        <AdminView />
      </FleetProvider>
    )

    const tabla = screen.getAllByRole("table")[0]
    expect(within(tabla).getAllByRole("row")).toHaveLength(6)
    expect(within(tabla).getByText("V-0005")).toBeInTheDocument()
  })

  it("muestra la cantidad de viajes por tipo de servicio", () => {
    render(
      <FleetProvider>
        <AdminView />
      </FleetProvider>
    )

    expect(screen.getByText("Viajes por tipo de servicio")).toBeInTheDocument()
    expect(screen.getAllByText("Carga completa")).toHaveLength(2)
  })

  it("refleja una carga de combustible registrada por un conductor", async () => {
    const user = userEvent.setup()
    render(
      <FleetProvider>
        <ConductorView conductorId={3} onChangeConductor={vi.fn()} />
        <AdminView />
      </FleetProvider>
    )

    await user.click(screen.getByRole("button", { name: "Registrar carga de combustible" }))
    const modal = await screen.findByRole("dialog")
    await user.click(within(modal).getByRole("button", { name: "Registrar" }))

    expect(screen.getByText("Detalle de cargas de combustible")).toBeInTheDocument()
    expect(screen.getByText("F-0001")).toBeInTheDocument()
    expect(screen.queryByText(/aún no hay cargas registradas por conductores/)).not.toBeInTheDocument()
  })
})
