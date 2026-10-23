import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import ClienteView from "./ClienteView"
import { FleetProvider } from "../context/FleetProvider"

const renderCliente = (props = {}) =>
  render(
    <FleetProvider>
      <ClienteView clienteId={1} onChangeCliente={vi.fn()} {...props} />
    </FleetProvider>
  )

describe("ClienteView", () => {
  it("muestra los viajes del cliente seleccionado y no los de otros", () => {
    renderCliente({ clienteId: 2 })

    expect(screen.getByText("V-0002 · Santiago → Rancagua")).toBeInTheDocument()
    expect(screen.queryByText("V-0001 · Santiago → Concepción")).not.toBeInTheDocument()
  })

  it("avisa al cambiar de cliente con el selector", async () => {
    const user = userEvent.setup()
    const onChangeCliente = vi.fn()
    renderCliente({ onChangeCliente })

    await user.selectOptions(screen.getByRole("combobox", { name: "Cliente" }), "3")

    expect(onChangeCliente).toHaveBeenCalledWith(3)
  })

  it("calcula la distancia y el costo al escribir origen y destino", async () => {
    const user = userEvent.setup()
    renderCliente()

    await user.type(screen.getByLabelText(/Origen/), "Santiago")
    await user.type(screen.getByLabelText(/Destino/), "Concepción")

    expect(screen.getByLabelText(/Distancia estimada/)).toHaveValue(520)
    expect(screen.getByText("$1.450.000")).toBeInTheDocument()
  })

  it("recalcula el costo al cambiar el tipo de servicio", async () => {
    const user = userEvent.setup()
    renderCliente()

    await user.type(screen.getByLabelText(/Origen/), "Santiago")
    await user.type(screen.getByLabelText(/Destino/), "Concepción")
    await user.selectOptions(screen.getByLabelText(/Tipo de servicio/), "TR003")

    expect(screen.getByText("$2.070.000")).toBeInTheDocument()
  })

  it("marca los campos faltantes si se envía el formulario vacío", async () => {
    const user = userEvent.setup()
    renderCliente()

    await user.click(screen.getByRole("button", { name: "Solicitar viaje" }))

    expect(screen.getByText(/Faltan datos obligatorios/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Origen/)).toHaveClass("is-invalid")
    expect(screen.getByLabelText(/Descripción de la carga/)).toHaveClass("is-invalid")
  })

  it("registra el viaje y limpia el formulario cuando está completo", async () => {
    const user = userEvent.setup()
    renderCliente()

    await user.type(screen.getByLabelText(/Origen/), "Santiago")
    await user.type(screen.getByLabelText(/Destino/), "Concepción")
    await user.type(screen.getByLabelText(/Descripción de la carga/), "Repuestos")
    await user.click(screen.getByRole("button", { name: "Solicitar viaje" }))

    expect(screen.getByText("V-0006 · Santiago → Concepción")).toBeInTheDocument()
    expect(screen.getByLabelText(/Origen/)).toHaveValue("")
    expect(screen.queryByText(/Faltan datos obligatorios/)).not.toBeInTheDocument()
  })

  it("muestra el estado y el mensaje de cada viaje según su situación", () => {
    renderCliente({ clienteId: 1 })

    expect(screen.getByText("Hemos recibido tu solicitud de viaje y estamos asignando recursos.")).toBeInTheDocument()
    expect(screen.getByText("Puedes calificar este servicio.")).toBeInTheDocument()
  })

  it("indica que aún no hay ubicación cuando el viaje va en tránsito sin reporte", () => {
    renderCliente({ clienteId: 2 })

    expect(screen.getByText(/Aún sin reporte de ubicación del conductor/)).toBeInTheDocument()
  })

  it("muestra el vehículo y el conductor asignados", () => {
    renderCliente({ clienteId: 3 })

    expect(screen.getByText(/Vehículo asignado: AB1234/)).toBeInTheDocument()
    expect(screen.getByText(/Conductor: Héctor Rojas/)).toBeInTheDocument()
  })
})
