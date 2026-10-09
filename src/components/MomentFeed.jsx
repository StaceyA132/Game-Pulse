import './MomentFeed.css'

// A small icon for each kind of moment on the timeline.
function iconFor(sport, moment) {
  if (moment.type === 'card') return moment.label === 'Red card' ? '🟥' : '🟨'
  const icons = {
    period: '⏱️',
    final: '🏁',
    leader: '📊',
    ace: '🎯',
    eagle: '🦅',
    birdie: '🔥',
    bogey: '😬',
    match: '🏆',
  }
  return icons[moment.type] ?? sport.emoji
}

export function MomentFeed({ sport, moments, newIds }) {
  // Newest at the top, like a live play-by-play.
  const newestFirst = [...moments].reverse()

  return (
    <section className="panel moment-feed">
      <div className="panel__head">
        <h3 className="panel__title">
          ⏱️ Timeline <span className="panel__count">{moments.length}</span>
        </h3>
      </div>
      <ol className="panel__body timeline">
        {newestFirst.map((m) => (
          <li
            key={m.id}
            className={`timeline__item ${m.major ? 'timeline__item--major' : ''} ${newIds.has(m.id) ? 'timeline__item--new' : ''}`}
          >
            <span className="timeline__dot" aria-hidden="true">
              {iconFor(sport, m)}
            </span>
            <div className="timeline__content">
              <div className="timeline__top">
                <span className="timeline__label">{m.label}</span>
                <span className="timeline__clock">{m.clock}</span>
              </div>
              <p className="timeline__text">{m.text}</p>
              {m.score && <span className="timeline__score">{m.score}</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
