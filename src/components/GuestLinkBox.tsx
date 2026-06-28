import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

/** Guest link field with copy and a toggle-able QR code. */
export function GuestLinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = link
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="guest-link-box">
      <div className="share-row">
        <input className="share-field" type="text" readOnly value={link} aria-label="Guest link" />
        <button type="button" className="btn primary" onClick={copy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <button type="button" className="btn ghost qr-toggle" onClick={() => setShowQr((s) => !s)}>
        {showQr ? 'Hide QR code' : 'Show QR code'}
      </button>
      {showQr && (
        <div className="qr-wrap">
          <div className="qr-frame">
            <QRCodeSVG value={link} size={208} level="L" fgColor="#273640" bgColor="#ffffff" />
          </div>
          <p className="admin-hint">Guests can scan this to open the menu.</p>
        </div>
      )}
    </div>
  )
}
