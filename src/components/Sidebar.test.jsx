import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import Sidebar from "./Sidebar"

const ROLES = ["Cliente", "Conductor", "Supervisor de ruta", "Jefe de flota", "Mantenimiento", "Administrador"]

describe("Sidebar", () => {
  it("muestra un botón por cada rol en el menú lateral", () => {
    render(<Sidebar currentRole="cliente" onChange={vi.fn()} />)

    ROLES.forEach((rol) => {
      expect(screen.getByRole("button", { name: rol })).toBeInTheDocument()
    })
  })

  it("marca como activo el rol actual", () => {
    render(<Sidebar currentRole="jefe" onChange={vi.fn()} />)

    expect(screen.getByRole("button", { name: "Jefe de flota" })).toHaveClass("active")
    expect(screen.getByRole("button", { name: "Cliente" })).not.toHaveClass("active")
  })

  it("llama a onChange con el id del rol al hacer clic", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Sidebar currentRole="cliente" onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Mantenimiento" }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith("mantenimiento")
  })

  it("no llama a onChange si no se hace clic", () => {
    const onChange = vi.fn()
    render(<Sidebar currentRole="cliente" onChange={onChange} />)

    expect(onChange).not.toHaveBeenCalled()
  })

  it("en la barra móvil muestra el nombre del rol actual", () => {
    render(<Sidebar currentRole="supervisor" onChange={vi.fn()} />)

    expect(screen.getByText("Supervisor de ruta")).toBeInTheDocument()
  })

  it("abre el panel móvil, elige un rol y lo cierra", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Sidebar currentRole="cliente" onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Abrir menú" }))
    const panel = await screen.findByRole("dialog")
    await user.click(within(panel).getByRole("button", { name: /Administrador/ }))

    expect(onChange).toHaveBeenCalledWith("admin")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })
})
