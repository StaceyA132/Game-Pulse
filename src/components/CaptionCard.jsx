import { useState } from 'react'

export function CaptionCard({ caption, isNew }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(caption.text)
    setCopied(true)
  }

  return (
    <div>
      {isNew ? '🆕 ' : ''}
      <pre style={{ whiteSpace: 'pre-wrap' }}>{caption.text}</pre>
      <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
      <hr />
    </div>
  )
}
