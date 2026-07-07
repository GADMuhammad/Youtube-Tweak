export interface Tab<T extends string> {
  id: T
  label?: string
  disabled?: boolean
  tooltip?: string
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
      {tabs.map(({ id, label, disabled, tooltip }) => (
        <button
          key={id}
          type="button"
          className={`popup-tab ${id === active ? "popup-tab--active" : ""} ${disabled ? "popup-tab--disabled" : ""}`}
          data-tooltip={disabled ? tooltip : undefined}
          onClick={() => !disabled && onChange(id)}>
          {label ?? id}
        </button>
      ))}
    </div>
  )
}
