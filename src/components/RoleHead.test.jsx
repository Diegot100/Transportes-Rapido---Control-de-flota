import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import RoleHead from "./RoleHead"

describe("RoleHead", () => {
  it("muestra el título en un heading", () => {
    render(<RoleHead title="Portal del cliente" description="Solicita un viaje" />)

    expect(screen.getByRole("heading", { name: "Portal del cliente" })).toBeInTheDocument()
  })

  it("muestra la descripción", () => {
    render(<RoleHead title="Portal del cliente" description="Solicita un viaje" />)

    expect(screen.getByText("Solicita un viaje")).toBeInTheDocument()
  })

  it("renderiza el contenido extra que recibe como children", () => {
    render(
      <RoleHead title="Portal del cliente" description="Solicita un viaje">
        <button>Cambiar cliente</button>
      </RoleHead>
    )

    expect(screen.getByRole("button", { name: "Cambiar cliente" })).toBeInTheDocument()
  })
})
