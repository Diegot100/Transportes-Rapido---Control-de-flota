import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Topbar from "./Topbar"

describe("Topbar", () => {
  it("muestra el nombre del sistema", () => {
    render(<Topbar />)

    expect(screen.getByRole("heading", { name: "Ruta Control" })).toBeInTheDocument()
    expect(screen.getByText("Transportes Rápido — gestión de flota")).toBeInTheDocument()
  })

  it("incluye el buscador deshabilitado", () => {
    render(<Topbar />)

    expect(screen.getByPlaceholderText("Buscar viaje, patente o cliente...")).toBeDisabled()
  })
})
