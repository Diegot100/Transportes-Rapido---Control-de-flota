import { describe, it, expect } from "vitest"
import { fmtCLP, fmtNum } from "./format"

describe("fmtCLP", () => {
  it("agrega el símbolo $ y separa los miles con punto", () => {
    expect(fmtCLP(150000)).toBe("$150.000")
  })

  it("formatea números grandes", () => {
    expect(fmtCLP(1234567)).toBe("$1.234.567")
  })

  it("formatea el cero", () => {
    expect(fmtCLP(0)).toBe("$0")
  })

  it("redondea los decimales", () => {
    expect(fmtCLP(1999.6)).toBe("$2.000")
  })
})

describe("fmtNum", () => {
  it("separa los miles con punto, sin símbolo", () => {
    expect(fmtNum(145000)).toBe("145.000")
  })
})
