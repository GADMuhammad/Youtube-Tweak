import { supportSectionText } from "~helpers/translationObject"

import {
  InstaPayIcon,
  LinkedInIcon,
  MailIcon,
  TelegramIcon,
  WalletIcon
} from "./icons"
import { Panel } from "./Panel"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = supportSectionText[isArabic ? "ar" : "en"]

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
