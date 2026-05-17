type SectionHeaderProps = {
  title: string
  action?: React.ReactNode
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-base">{title}</h2>
      {action}
    </div>
  )
}
