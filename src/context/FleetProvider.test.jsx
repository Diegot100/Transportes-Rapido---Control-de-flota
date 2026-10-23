import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, it, expect, vi } from "vitest"
import { FleetProvider } from "./FleetProvider"
import { useFleet } from "./useFleet"

const viajeNuevo = { clienteId: 1, origen: "Santiago", destino: "Talca", servicio: "TR002", carga: "Abarrotes", kmEstimado: 260 }

function Panel() {
  const { trips, toast, solicitarViaje, cancelarViaje, avanzarViaje } = useFleet()
  return (
    <div>
      <p>viajes: {trips.length}</p>
      <p>aviso: {toast?.msg ?? "ninguno"}</p>
      <p>estado V-0004: {trips.find((t) => t.id === "V-0004").estado}</p>
      <button onClick={() => solicitarViaje(viajeNuevo)}>solicitar</button>
      <button onClick={() => cancelarViaje("V-0004")}>cancelar</button>
      <button onClick={() => avanzarViaje("V-0004", "Entregado")}>entregar</button>
    </div>
  )
}

const renderPanel = () =>
  render(
    <FleetProvider>
      <Panel />
    </FleetProvider>
  )

afterEach(() => {
  vi.useRealTimers()
})

describe("FleetProvider y useFleet", () => {
  it("entrega los datos iniciales de la flota", () => {
    renderPanel()

    expect(screen.getByText("viajes: 5")).toBeInTheDocument()
    expect(screen.getByText("aviso: ninguno")).toBeInTheDocument()
  })

  it("agrega el viaje y muestra un aviso al solicitarlo", async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole("button", { name: "solicitar" }))

    expect(screen.getByText("viajes: 6")).toBeInTheDocument()
    expect(screen.getByText("aviso: Solicitud de viaje enviada.")).toBeInTheDocument()
  })

  it("cancela y avanza viajes avisando cada vez", async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole("button", { name: "cancelar" }))
    expect(screen.getByText("estado V-0004: Cancelado")).toBeInTheDocument()
    expect(screen.getByText("aviso: Viaje V-0004 cancelado.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "entregar" }))
    expect(screen.getByText("estado V-0004: Entregado")).toBeInTheDocument()
    expect(screen.getByText("aviso: Estado del viaje actualizado.")).toBeInTheDocument()
  })

  it("oculta el aviso solo después de 2,6 segundos (temporizador simulado)", () => {
    vi.useFakeTimers()
    renderPanel()

    act(() => {
      screen.getByRole("button", { name: "solicitar" }).click()
    })
    expect(screen.getByText("aviso: Solicitud de viaje enviada.")).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2600)
    })
    expect(screen.getByText("aviso: ninguno")).toBeInTheDocument()
  })

  it("lanza un error claro si useFleet se usa fuera del proveedor", () => {
    const consola = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => render(<Panel />)).toThrow("useFleet debe usarse dentro de FleetProvider")

    consola.mockRestore()
  })
})
