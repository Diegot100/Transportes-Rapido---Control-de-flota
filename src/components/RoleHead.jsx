function RoleHead({ title, description, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
      <div>
        <h2 className="page-title mb-1">{title}</h2>
        <p className="text-secondary small mb-0 role-desc">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default RoleHead
