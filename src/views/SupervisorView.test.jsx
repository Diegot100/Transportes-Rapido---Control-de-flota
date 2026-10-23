import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import SupervisorView from "./SupervisorView"
import { FleetProvider } from "../context/FleetProvider"

const renderSupervisor = () =>
  render(
    <FleetProvider>
      <SupervisorView />
    </FleetProvider>
  )

const columna = (nombre) => screen.getByText(nombre, { selector: ".board-col-head" }).closest(".board-col")

describe("SupervisorView", () => {
  it("muestra las 5 columnas del tablero con sus viajes", () => {
    renderSupervisor()

    expect(within(columna("Solicitado")).getByText("V-0004")).toBeInTheDocument()
    expect(within(columna("Asignado")).getByText("V-0003")).toBeInTheDocument()
    expect(within(columna("En tránsito")).getByText("V-0002")).toBeInTheDocument()
    expect(within(columna("Entregado")).getByText("V-0001")).toBeInTheDocument()
    expect(within(columna("Cancelado")).getByText("V-0005")).toBeInTheDocument()
  })

  it("asigna un viaje solicitado y lo mueve a la columna Asignado", async () => {
    const user = userEvent.setup()
    renderSupervisor()

    await user.click(screen.getByRole("button", { name: "Asignar" }))

    expect(within(columna("Asignado")).getByText("V-0004")).toBeInTheDocument()
    expect(within(columna("Solicitado")).getByText("Sin viajes.")).toBeInTheDocument()
  })

  it("permite elegir el vehículo y el conductor antes de asignar", async () => {
    const user = userEvent.setup()
    renderSupervisor()

    await user.selectOptions(screen.getByLabelText("Conductor para V-0004"), "2")
    await user.click(screen.getByRole("button", { name: "Asignar" }))

    expect(within(columna("Asignado")).getByText(/Marcela Toro/)).toBeInTheDocument()
  })

  it("cancela un viaje solicitado", async () => {
    const user = userEvent.setup()
    renderSupervisor()

    await user.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(within(columna("Cancelado")).getByText("V-0004")).toBeInTheDocument()
  })

  it("abre las novedades de un viaje y avisa si no tiene ninguna", async () => {
    const user = userEvent.setup()
    renderSupervisor()

    await user.click(within(columna("Asignado")).getByRole("button", { name: "Ver novedades (0)" }))

    expect(await screen.findByRole("dialog", { name: "Novedades · V-0003" })).toBeInTheDocument()
    expect(screen.getByText("Sin novedades reportadas para este viaje.")).toBeInTheDocument()
  })

  it("lista la disponibilidad de vehículos y conductores", () => {
    renderSupervisor()

    expect(screen.getByText("Disponibilidad de vehículos")).toBeInTheDocument()
    expect(screen.getByText("AB1234")).toBeInTheDocument()
    expect(screen.getByText("Soledad Vera")).toBeInTheDocument()
  })
})
