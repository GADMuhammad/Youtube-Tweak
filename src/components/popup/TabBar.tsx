export interface Tab<T extends string> {
  id: T
  label?: string
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  className
}: TabBarProps<T>) {
  return (
    <div className={`popup-tabbar ${className ?? ""}`}>
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`popup-tab ${id === active ? "popup-tab--active" : ""}`}
          onClick={() => onChange(id)}>
          {label ?? id}
        </button>
      ))}
    </div>
  )
}
