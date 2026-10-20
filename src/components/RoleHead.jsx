export default function Badge({ clase, children, style }) {
  return (
    <span className={`badge ${clase}`} style={style}>
      {children}
    </span>
  )
}
