import {
  CalendarIcon,
  ChevronDownIcon,
  InfiniteScrollIcon,
  SupportIcon
} from "./icons"

export type PopupSection = "date" | "scroll" | "support"

interface MainMenuProps {
  labels: Record<PopupSection, string>
  onSelect: (section: PopupSection) => void
}

const items: { id: PopupSection; Icon: typeof CalendarIcon }[] = [
  { id: "date", Icon: CalendarIcon },
  { id: "scroll", Icon: InfiniteScrollIcon },
  { id: "support", Icon: SupportIcon }
]

export function MainMenu({ labels, onSelect }: MainMenuProps) {
  return (
    <div className="popup-menu">
      {items.map(({ id, Icon }) => (
        <button
          key={id}
          type="button"
          className="popup-menu-item"
          onClick={() => onSelect(id)}>
          <span className="popup-menu-item__content">
            <span className="popup-menu-item__label">{labels[id]}</span>
            <Icon className="popup-menu-item__icon" />
          </span>
          <ChevronDownIcon className="popup-menu-item__chevron" />
        </button>
      ))}
    </div>
  )
}
