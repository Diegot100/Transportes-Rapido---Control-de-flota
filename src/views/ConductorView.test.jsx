import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import ConductorView from "./ConductorView"
import { FleetProvider } from "../context/FleetProvider"

const renderConductor = (props = {}) =>
  render(
    <FleetProvider>
      <ConductorView conductorId={1} onChangeConductor={vi.fn()} {...props} />
    </FleetProvider>
  )

describe("ConductorView", () => {
  it("avisa cuando el conductor no tiene viajes asignados", () => {
    renderConductor({ conductorId: 4 })

    expect(screen.getByText("No tienes viajes asignados en este momento.")).toBeInTheDocument()
  })

  it("avisa al cambiar de conductor con el selector", async () => {
    const user = userEvent.setup()
    const onChangeConductor = vi.fn()
    renderConductor({ onChangeConductor })

    await user.selectOptions(screen.getByRole("combobox", { name: "Conductor" }), "2")

    expect(onChangeConductor).toHaveBeenCalledWith(2)
  })

  it("permite iniciar un viaje asignado y luego marcarlo como entregado", async () => {
    const user = userEvent.setup()
    renderConductor({ conductorId: 1 })

    await user.click(screen.getByRole("button", { name: "Iniciar viaje (marcar en tránsito)" }))
    expect(screen.getByRole("button", { name: "Marcar como entregado" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Actualizar mi ubicación" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Marcar como entregado" }))
    expect(screen.getByText("No tienes viajes asignados en este momento.")).toBeInTheDocument()
  })

  it("reporta la ubicación desde un modal y la muestra en la tarjeta", async () => {
    const user = userEvent.setup()
    renderConductor({ conductorId: 3 })
    expect(screen.getByText(/Sin ubicación reportada aún/)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Actualizar mi ubicación" }))
    const modal = await screen.findByRole("dialog", { name: "Actualizar ubicación" })
    await user.type(within(modal).getByRole("textbox"), "Talca, Ruta 5 Sur")
    await user.click(within(modal).getByRole("button", { name: "Actualizar" }))

    expect(screen.getByText("Talca, Ruta 5 Sur")).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("registra una carga de combustible y la lista en la tabla", async () => {
    const user = userEvent.setup()
    renderConductor({ conductorId: 3 })
    expect(screen.getByText("Aún no registras cargas de combustible.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Registrar carga de combustible" }))
    const modal = await screen.findByRole("dialog", { name: "Registrar carga de combustible" })
    await user.click(within(modal).getByRole("button", { name: "Registrar" }))

    expect(screen.getByText("80 L")).toBeInTheDocument()
    expect(screen.getByText("$96.000")).toBeInTheDocument()
  })

  it("permite cerrar el modal de novedad sin reportar nada", async () => {
    const user = userEvent.setup()
    renderConductor({ conductorId: 1 })

    await user.click(screen.getByRole("button", { name: "Reportar novedad" }))
    const modal = await screen.findByRole("dialog", { name: "Reportar novedad" })
    await user.click(within(modal).getByRole("button", { name: "Cancelar" }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("muestra el historial reciente del conductor", () => {
    renderConductor({ conductorId: 3 })

    expect(screen.getByText("Historial reciente")).toBeInTheDocument()
    expect(screen.getByText("V-0001")).toBeInTheDocument()
  })
})
