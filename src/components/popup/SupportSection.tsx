import { type ReactNode } from "react"

import { supportSectionText } from "~helpers/translationObject"

import {
  GitHubIcon,
  InstaPayIcon,
  LinkedInIcon,
  MailIcon,
  PayPalIcon,
  TelegramIcon,
  WalletIcon,
  XIcon
} from "./icons"
import { Panel } from "./Panel"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = supportSectionText[isArabic ? "ar" : "en"]

const CONTACT_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/GADMuhammad",
    icon: <GitHubIcon />
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mohgad/",
    icon: <LinkedInIcon />
  },
  {
    label: "Email",
    href: "mailto:gad.software.engineer@gmail.com",
    icon: <MailIcon />
  },
  {
    label: "Telegram",
    href: "https://t.me/mohgad",
    icon: <TelegramIcon />
  },
  {
    label: "X (English)",
    href: "https://x.com/gad_software",
    icon: <XIcon />
  },
  {
    label: "X (Arabic)",
    href: "https://x.com/mohgad_",
    icon: <XIcon />
  }
]

const DONATION_LINKS = [
  {
    label: "PayPal",
    href: "https://www.paypal.com/ncp/payment/XL4BLH6V4WXBJ",
    icon: <PayPalIcon />
  },
  // {
  //   label: "Vodafone Cash",
  //   href: "http://vf.eg/vfcash?id=mt&qrId=yV2w6L",
  //   icon: <WalletIcon />
  // },
  {
    label: "InstaPay",
    href: "https://ipn.eg/S/mohgad_/instapay/1F8tgu",
    icon: <InstaPayIcon />
  }
]

interface LinkRowProps {
  label: string
  href: string
  icon: ReactNode
}

function LinkRow({ label, href, icon }: LinkRowProps) {
  return (
    <a
      className="popup-support-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer">
      <span className="popup-support-link__icon">{icon}</span>
      <span className="popup-support-link__label">{label}</span>
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
