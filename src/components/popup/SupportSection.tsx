import { supportSectionText } from "~helpers/translationObject"

import { Panel } from "./Panel"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = supportSectionText[isArabic ? "ar" : "en"]

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5.001zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H9z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M21.5 3.5 2.7 10.8c-.9.36-.88 1.66.03 1.98l4.4 1.55 1.7 5.4c.27.85 1.35 1.1 1.96.45l2.6-2.75 4.4 3.3c.8.6 1.95.16 2.14-.83L23.9 4.7c.2-1.05-.85-1.9-1.83-1.5zM8.5 14l9-6.7-7 7.6-.15 3-1.85-3.9z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.2" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function InstaPayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h10M7 13h6" />
    </svg>
  )
}

const CONTACT_LINKS = [
  {
    label: "LinkedIn",
    value: "linkedin.com/in/mohgad",
    href: "https://www.linkedin.com/in/mohgad/",
    icon: <LinkedInIcon />
  },
  {
    label: "Telegram",
    value: "@mohgad",
    href: "https://t.me/mohgad",
    icon: <TelegramIcon />
  },
  {
    label: "Email",
    value: "gad.software.engineer@gmail.com",
    href: "mailto:gad.software.engineer@gmail.com",
    icon: <MailIcon />
  }
]

const DONATION_LINKS = [
  {
    label: "Vodafone Cash",
    value: "+201069429820",
    href: "http://vf.eg/vfcash?id=mt&qrId=yV2w6L",
    icon: <WalletIcon />
  },
  {
    label: "InstaPay",
    value: "@mohgad_",
    href: "https://ipn.eg/S/mohgad_/instapay/1F8tgu",
    icon: <InstaPayIcon />
  }
]

interface LinkRowProps {
  label: string
  value: string
  href: string
  icon: React.ReactNode
}

function LinkRow({ label, value, href, icon }: LinkRowProps) {
  return (
    <a
      className="popup-support-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer">
      <span className="popup-support-link__icon">{icon}</span>
      <span className="popup-support-link__text">
        <span className="popup-support-link__label">{label}</span>
        <span className="popup-support-link__value" dir="ltr">
          {value}
        </span>
      </span>
    </a>
  )
}

export function SupportSection() {
  return (
    <Panel>
      <div className="popup-support">
        <div className="popup-support-group">
          <h3 className="popup-support-group__title">{text.contactTitle}</h3>
          <p className="popup-support-group__desc">{text.contactDescription}</p>
          <div className="popup-support-links">
            {CONTACT_LINKS.map((link) => (
              <LinkRow key={link.label} {...link} />
            ))}
          </div>
        </div>

        <div className="popup-support-group">
          <h3 className="popup-support-group__title">{text.supportTitle}</h3>
          <p className="popup-support-group__desc">{text.supportDescription}</p>
          <div className="popup-support-links">
            {DONATION_LINKS.map((link) => (
              <LinkRow key={link.label} {...link} />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}
