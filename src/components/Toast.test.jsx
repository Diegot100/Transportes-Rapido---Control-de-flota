import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Toast from "./Toast"

describe("Toast", () => {
  it("muestra el mensaje recibido", () => {
    render(<Toast message="Solicitud de viaje enviada." />)

    expect(screen.getByText("Solicitud de viaje enviada.")).toBeVisible()
  })

  it("no muestra nada cuando no hay mensaje", () => {
    render(<Toast message={null} />)

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
