import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { CombustibleModal, NovedadesModal, TextPromptModal } from "./TripModals"

describe("TextPromptModal", () => {
  const renderModal = (props = {}) =>
    render(
      <TextPromptModal
        title="Reportar novedad"
        label="Describe la novedad"
        placeholder="Ej: tráfico"
        submitLabel="Reportar"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        {...props}
      />
    )

  it("muestra el título y deshabilita el botón de enviar mientras el campo está vacío", () => {
    renderModal()

    expect(screen.getByRole("dialog", { name: "Reportar novedad" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reportar" })).toBeDisabled()
  })

  it("llama a onSubmit con el texto escrito y luego cierra el modal", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    renderModal({ onSubmit, onClose })

    await user.type(screen.getByLabelText("Describe la novedad"), "  Tráfico en la ruta  ")
    await user.click(screen.getByRole("button", { name: "Reportar" }))

    expect(onSubmit).toHaveBeenCalledWith("Tráfico en la ruta")
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("cierra sin enviar al presionar Cancelar", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    renderModal({ onSubmit, onClose })

    await user.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("cierra al presionar la tecla Escape", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ onClose })

    await user.keyboard("{Escape}")

    expect(onClose).toHaveBeenCalled()
  })

  it("no envía si el texto son solo espacios", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderModal({ onSubmit })

    await user.type(screen.getByLabelText("Describe la novedad"), "   {Enter}")

    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe("CombustibleModal", () => {
  it("envía 80 litros y el costo sugerido por defecto", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CombustibleModal onSubmit={onSubmit} onClose={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Registrar" }))

    expect(onSubmit).toHaveBeenCalledWith(80, 96000)
  })

  it("recalcula el costo sugerido al cambiar los litros", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CombustibleModal onSubmit={onSubmit} onClose={vi.fn()} />)

    const litros = screen.getByLabelText("Litros cargados")
    await user.clear(litros)
    await user.type(litros, "50")
    await user.click(screen.getByRole("button", { name: "Registrar" }))

    expect(screen.getByLabelText("Costo total (CLP)")).toHaveValue(60000)
    expect(onSubmit).toHaveBeenCalledWith(50, 60000)
  })

  it("respeta el costo editado a mano", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CombustibleModal onSubmit={onSubmit} onClose={vi.fn()} />)

    const costo = screen.getByLabelText("Costo total (CLP)")
    await user.clear(costo)
    await user.type(costo, "100000")
    await user.click(screen.getByRole("button", { name: "Registrar" }))

    expect(onSubmit).toHaveBeenCalledWith(80, 100000)
  })

  it("deshabilita el registro si se borra el costo", async () => {
    const user = userEvent.setup()
    render(<CombustibleModal onSubmit={vi.fn()} onClose={vi.fn()} />)

    await user.clear(screen.getByLabelText("Costo total (CLP)"))

    expect(screen.getByLabelText("Costo total (CLP)")).toHaveValue(null)
    expect(screen.getByRole("button", { name: "Registrar" })).toBeDisabled()
  })

  it("deshabilita el registro si los litros quedan vacíos", async () => {
    const user = userEvent.setup()
    render(<CombustibleModal onSubmit={vi.fn()} onClose={vi.fn()} />)

    await user.clear(screen.getByLabelText("Litros cargados"))

    expect(screen.getByRole("button", { name: "Registrar" })).toBeDisabled()
  })
})

describe("NovedadesModal", () => {
  it("lista las novedades del viaje", () => {
    const trip = { id: "V-0002", novedades: ["Tráfico", "Desvío por obras"] }
    render(<NovedadesModal trip={trip} onClose={vi.fn()} />)

    expect(screen.getByRole("dialog", { name: "Novedades · V-0002" })).toBeInTheDocument()
    expect(screen.getByText("Tráfico")).toBeInTheDocument()
    expect(screen.getByText("Desvío por obras")).toBeInTheDocument()
  })

  it("avisa cuando el viaje no tiene novedades", () => {
    render(<NovedadesModal trip={{ id: "V-0001", novedades: [] }} onClose={vi.fn()} />)

    expect(screen.getByText("Sin novedades reportadas para este viaje.")).toBeInTheDocument()
  })

  it("llama a onClose al presionar Cerrar", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<NovedadesModal trip={{ id: "V-0001", novedades: [] }} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: "Cerrar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
