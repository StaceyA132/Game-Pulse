import { useState } from 'react'

const POST_LIMIT = 280

// Shows hashtags in the sport's color, like a real post.
function PostText({ text }) {
  return text.split(/(#\w+)/).map((part, i) =>
    part.startsWith('#') ? (
      <span key={i} className="post__tag">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

export function CaptionCard({ caption, clock, isNew }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(caption.text)
    setCopied(true)
  }

  return (
    <li className={`post ${isNew ? 'post--new' : ''}`}>
      <div className="post__author">
        <span className="post__avatar" aria-hidden="true">
          GP
        </span>
        <span className="post__names">
          <strong>GamePulse</strong>
          <span>@GamePulse · {isNew ? 'now' : clock}</span>
        </span>
      </div>
      <p className="post__text">
        <PostText text={caption.text} />
      </p>
      <div className="post__footer">
        <span className="post__length">
          {caption.text.length}/{POST_LIMIT}
        </span>
        <button className="btn" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy post'}
        </button>
      </div>
    </li>
  )
}
