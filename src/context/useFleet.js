import { useContext } from "react"
import { FleetContext } from "./fleetContext"

export function useFleet() {
  const ctx = useContext(FleetContext)
  if (!ctx) throw new Error("useFleet debe usarse dentro de FleetProvider")
  return ctx
}
