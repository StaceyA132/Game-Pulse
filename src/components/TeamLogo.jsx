import { useState } from 'react'
import './TeamLogo.css'

// A team logo (on a white circle, so dark logos show up on dark backgrounds)
// or a player's country flag. Decorative: the name is always shown next to it.
// If the image fails to load, nothing is shown.
export function TeamLogo({ competitor, size = 32 }) {
  const [failed, setFailed] = useState(false)
  const src = competitor?.logo ?? competitor?.flag
  if (!src || failed) return null

  return (
    <img
      className={competitor.logo ? 'team-logo' : 'team-logo team-logo--flag'}
      src={src}
      alt=""
      width={size}
      height={competitor.logo ? size : Math.round(size * 0.7)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
