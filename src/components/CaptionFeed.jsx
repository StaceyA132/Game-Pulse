import { useMemo, useState } from 'react'
import { makeCaption, TONES } from '../content/captions'
import { CaptionCard } from './CaptionCard'

export function CaptionFeed({ sport, league, game, moments, newIds }) {
  const [tone, setTone] = useState('hype')

  // Captions are for the big moments only, newest first.
  const captions = useMemo(
    () =>
      moments
        .filter((m) => m.major)
        .map((m) => makeCaption(sport, league, game, m, tone))
        .reverse(),
    [moments, game, sport, league, tone],
  )

  return (
    <section>
      <h3>📱 Social captions ({captions.length})</h3>
      <p>
        Tone:{' '}
        {Object.entries(TONES).map(([key, name]) => (
          <button key={key} onClick={() => setTone(key)} disabled={key === tone}>
            {name}
          </button>
        ))}
      </p>
      {captions.map((c) => (
        // Keyed by tone too, so switching tone resets "Copied ✓".
        <CaptionCard key={c.id} caption={c} isNew={newIds.has(c.momentId)} />
      ))}
    </section>
  )
}
