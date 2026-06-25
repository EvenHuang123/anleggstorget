interface Props {
  label: string
  className?: string
}

export function CategoryBadge({ label, className }: Props) {
  return (
    <span className={`tag tag-category${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  )
}
