import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import MantenimientoView from "./MantenimientoView"
import { FleetProvider } from "../context/FleetProvider"

const renderMantenimiento = () =>
  render(
    <FleetProvider>
      <MantenimientoView />
    </FleetProvider>
  )

describe("MantenimientoView", () => {
  it("alerta por los vehículos que superan el intervalo de mantención", () => {
    renderMantenimiento()

    expect(screen.getByText(/acumula 20\.000 km/)).toBeInTheDocument()
    expect(screen.getByText(/acumula 25\.000 km/)).toBeInTheDocument()
  })

  it("marca los campos faltantes si se guarda el formulario vacío", async () => {
    const user = userEvent.setup()
    renderMantenimiento()

    await user.click(screen.getByRole("button", { name: /Guardar y actualizar/ }))

    expect(screen.getByText(/Faltan datos obligatorios/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Detalle/)).toHaveClass("is-invalid")
  })

  it("registra una mantención y la agrega al historial", async () => {
    const user = userEvent.setup()
    renderMantenimiento()

    await user.type(screen.getByLabelText(/Detalle/), "Cambio de neumáticos")
    await user.type(screen.getByLabelText(/Fecha programada/), "2026-10-30")
    await user.click(screen.getByRole("button", { name: /Guardar y actualizar/ }))

    expect(screen.getByText("Cambio de neumáticos")).toBeInTheDocument()
    expect(screen.getByLabelText(/Detalle/)).toHaveValue("")
  })

  it("cierra una mantención y retira la alerta del vehículo", async () => {
    const user = userEvent.setup()
    renderMantenimiento()
    expect(screen.getByText(/acumula 20\.000 km/)).toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: "Marcar terminada" })[1])

    expect(screen.queryByText(/acumula 20\.000 km/)).not.toBeInTheDocument()
  })

  it("permite elegir el tipo de mantención", async () => {
    const user = userEvent.setup()
    renderMantenimiento()

    await user.selectOptions(screen.getByLabelText(/Tipo/), "Correctivo")

    expect(screen.getByLabelText(/Tipo/)).toHaveValue("Correctivo")
  })
})
