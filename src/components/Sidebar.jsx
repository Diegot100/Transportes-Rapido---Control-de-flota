export default function RoleHead({ title, description, children }) {
  return (
    <div className="role-head">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  )
}
