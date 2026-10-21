export const ROLES = [
  {
    id: "cliente",
    label: "Cliente",
    icon: (
      <>
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <line x1="12" y1="13" x2="12" y2="21" />
      </>
    ),
  },
  {
    id: "conductor",
    label: "Conductor",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.4" />
        <line x1="12" y1="3" x2="12" y2="9.4" />
        <line x1="5.5" y1="16" x2="10" y2="13.5" />
        <line x1="18.5" y1="16" x2="14" y2="13.5" />
      </>
    ),
  },
  {
    id: "supervisor",
    label: "Supervisor de ruta",
    icon: (
      <>
        <path d="M9 20l-5-2V6l5 2 6-2 5 2v12l-5-2-6 2z" />
        <line x1="9" y1="8" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="16" />
      </>
    ),
  },
  {
    id: "jefe",
    label: "Jefe de flota",
    icon: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4h6v2H9z" />
        <polyline points="8.5 13 11 15.5 15.5 10.5" />
      </>
    ),
  },
  {
    id: "mantenimiento",
    label: "Mantenimiento",
    icon: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z" />,
  },
  {
    id: "admin",
    label: "Administrador",
    icon: (
      <>
        <line x1="5" y1="20" x2="5" y2="12" />
        <line x1="12" y1="20" x2="12" y2="6" />
        <line x1="19" y1="20" x2="19" y2="15" />
      </>
    ),
  },
]
