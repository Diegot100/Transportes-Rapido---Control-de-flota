import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import JefeView from "./JefeView"
import { FleetProvider } from "../context/FleetProvider"

const renderJefe = () =>
  render(
    <FleetProvider>
      <JefeView />
    </FleetProvider>
  )

describe("JefeView", () => {
  it("calcula los vehículos disponibles sobre el total de la flota", () => {
    renderJefe()

    expect(screen.getByText("3/5")).toBeInTheDocument()
  })

  it("calcula la utilización según los viajes en tránsito", () => {
    renderJefe()

    expect(screen.getByText("20%")).toBeInTheDocument()
    expect(screen.getByText("en tránsito ahora")).toBeInTheDocument()
  })

  it("muestra el porcentaje de viajes con retraso y las fallas en curso", () => {
    renderJefe()

    expect(screen.getByText("Viajes entregados con retraso (0/1)")).toBeInTheDocument()
    expect(screen.getByText("Fallas correctivas en curso")).toBeInTheDocument()
  })

  it("muestra el rendimiento de cada conductor", () => {
    renderJefe()

    expect(screen.getByText("Héctor")).toBeInTheDocument()
    expect(screen.getByText("21")).toBeInTheDocument()
  })

  it("lista la flota con su próxima mantención", () => {
    renderJefe()

    expect(screen.getByText("Estado de la flota")).toBeInTheDocument()
    expect(screen.getByText("150.000 km")).toBeInTheDocument()
  })
})
