import { describe, it, expect } from "vitest"
import { estimarKm, normalizarCiudad } from "./distancia"

describe("normalizarCiudad", () => {
  it("pasa a minúsculas y quita tildes y espacios sobrantes", () => {
    const entrada = "  Ñuñoa! "

    const resultado = normalizarCiudad(entrada)

    expect(resultado).toBe("nunoa")
  })

  it("devuelve un texto vacío si no recibe nada", () => {
    expect(normalizarCiudad(undefined)).toBe("")
  })
})

describe("estimarKm", () => {
  it("calcula la distancia entre Santiago y una ciudad conocida", () => {
    expect(estimarKm("Santiago", "Concepción")).toBe(520)
  })

  it("calcula la distancia entre dos ciudades que no son Santiago", () => {
    expect(estimarKm("Talca", "Concepción")).toBe(260)
  })

  it("entrega 15 km cuando origen y destino son la misma ciudad", () => {
    expect(estimarKm("Santiago", "Santiago")).toBe(15)
  })

  it("ignora mayúsculas y tildes al reconocer las ciudades", () => {
    expect(estimarKm("SANTIAGO", "CONCEPCIÓN")).toBe(520)
  })

  it("usa solo la ciudad reconocida cuando falta una de las dos", () => {
    expect(estimarKm("", "Rancagua")).toBe(88)
  })

  it("entrega 300 km por defecto si no reconoce ninguna ciudad", () => {
    expect(estimarKm("xx", "yy")).toBe(300)
  })
})
