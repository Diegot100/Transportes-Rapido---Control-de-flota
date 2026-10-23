import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import ClienteView from "./ClienteView"
import { FleetProvider } from "../context/FleetProvider"
import { estimarKm } from "../utils/distancia"

vi.mock("../utils/distancia", () => ({
  estimarKm: vi.fn(() => 100),
}))

describe("ClienteView con estimarKm simulado", () => {
  it("usa la distancia que devuelve la función simulada", async () => {
    const user = userEvent.setup()
    render(
      <FleetProvider>
        <ClienteView clienteId={1} onChangeCliente={vi.fn()} />
      </FleetProvider>
    )

    await user.type(screen.getByLabelText(/Origen/), "Lugar inventado")

    expect(estimarKm).toHaveBeenCalledWith("Lugar inventado", "")
    expect(screen.getByLabelText(/Distancia estimada/)).toHaveValue(100)
    expect(screen.getByText("$400.000")).toBeInTheDocument()
  })
})
