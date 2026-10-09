import { useMemo, useState } from 'react'
import { makeCaption, TONES } from '../content/captions'
import { CaptionCard } from './CaptionCard'
import './CaptionFeed.css'

export function CaptionFeed({ sport, league, game, moments, newIds }) {
  const [tone, setTone] = useState('hype')

  // Captions are for the big moments only, newest first.
  const captions = useMemo(
    () =>
      moments
        .filter((m) => m.major)
        .map((m) => ({ moment: m, caption: makeCaption(sport, league, game, m, tone) }))
        .reverse(),
    [moments, game, sport, league, tone],
  )

  return (
    <section className="panel caption-feed">
      <div className="panel__head">
        <h3 className="panel__title">
          💬 Posts <span className="panel__count">{captions.length}</span>
        </h3>
        <div className="panel__controls" role="group" aria-label="Caption tone">
          {Object.entries(TONES).map(([key, name]) => (
            <button key={key} className="btn" aria-pressed={key === tone} onClick={() => setTone(key)}>
              {name}
            </button>
          ))}
        </div>
      </div>
      <ul className="panel__body">
        {captions.length === 0 && <li className="panel__empty">Posts appear for the big moments.</li>}
        {captions.map(({ moment, caption }) => (
          // The id includes the tone, so switching tone resets "Copied".
          <CaptionCard key={caption.id} caption={caption} clock={moment.clock} isNew={newIds.has(moment.id)} />
        ))}
      </ul>
    </section>
  )
}
