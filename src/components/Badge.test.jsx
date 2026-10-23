import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Badge from "./Badge"

describe("Badge", () => {
  it("muestra el texto recibido", () => {
    render(<Badge clase="b-disponible">Disponible</Badge>)

    expect(screen.getByText("Disponible")).toBeInTheDocument()
  })

  it("aplica la clase de color recibida por props", () => {
    render(<Badge clase="b-taller">En taller</Badge>)

    expect(screen.getByText("En taller")).toHaveClass("badge", "b-taller")
  })

  it("acepta estilos personalizados", () => {
    render(
      <Badge clase="b-viaje" style={{ color: "red" }}>
        En viaje
      </Badge>
    )

    expect(screen.getByText("En viaje")).toHaveStyle({ color: "rgb(255, 0, 0)" })
  })
})
