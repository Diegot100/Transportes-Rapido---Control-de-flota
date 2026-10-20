export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div>
            <h1>Ruta Control</h1>
            <span>Transportes Rápido — gestión de flota</span>
          </div>
        </div>
        <div className="topbar-search">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Buscar viaje, patente o cliente..." disabled />
        </div>
        <div className="topbar-right">
          <div className="topbar-avatar">TR</div>
        </div>
      </div>
    </div>
  )
}
