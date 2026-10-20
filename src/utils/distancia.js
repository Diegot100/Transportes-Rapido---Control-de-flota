import { KM_DESDE_SANTIAGO } from "../data/distancias"

const CIUDADES_ORDENADAS = Object.keys(KM_DESDE_SANTIAGO).sort((a, b) => b.length - a.length)

export function normalizarCiudad(txt) {
  return (txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
}

export function estimarKm(origenTxt, destinoTxt) {
  const o = normalizarCiudad(origenTxt)
  const d = normalizarCiudad(destinoTxt)
  const buscar = (txt) => CIUDADES_ORDENADAS.find((city) => txt.includes(city))
  const co = buscar(o)
  const cd = buscar(d)
  if (co && cd) {
    if (co === cd) return 15
    return (
      Math.abs(KM_DESDE_SANTIAGO[co] - KM_DESDE_SANTIAGO[cd]) ||
      Math.max(KM_DESDE_SANTIAGO[co], KM_DESDE_SANTIAGO[cd]) ||
      15
    )
  }
  if (co && !cd) return KM_DESDE_SANTIAGO[co] || 300
  if (cd && !co) return KM_DESDE_SANTIAGO[cd] || 300
  return 300
}
