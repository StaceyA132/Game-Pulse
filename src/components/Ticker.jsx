import { gameStatusText } from './gameStatus'
import { TeamLogo } from './TeamLogo'
import './Ticker.css'

function tickerText(game) {
  const [a, b] = game.competitors
  if (!a) return game.name
  if (!b || game.competitors.length > 2) return `${game.name}: ${a.shortName} ${a.score}` // golf leader
  if (game.state === 'pre') return `${a.shortName} vs ${b.shortName}`
  return `${a.shortName} ${a.score || 0} – ${b.score || 0} ${b.shortName}`
}

// A scrolling strip of the current league's scores, like a TV broadcast.
export function Ticker({ league, games }) {
  if (games.length === 0) return null
  const anyLive = games.some((g) => g.state === 'in')
  const items = games.slice(0, 20).map((game) => (
    <span key={game.id} className="ticker__item">
      {game.state === 'in' && <span className="live-dot" />}
      <TeamLogo competitor={game.competitors[0]} size={20} />
      <strong>{tickerText(game)}</strong>
      {game.competitors.length === 2 && <TeamLogo competitor={game.competitors[1]} size={20} />}
      <span className="ticker__status">{gameStatusText(game) || 'Final'}</span>
    </span>
  ))

  return (
    <div className="ticker" aria-label={`${league.name} scores`}>
      <span className={`ticker__label ${anyLive ? 'ticker__label--live' : ''}`}>{anyLive ? 'Live' : 'Scores'}</span>
      <div className="ticker__track">
        {/* Two copies, so the scroll can loop without a gap. */}
        <div className="ticker__scroll" style={{ animationDuration: `${Math.max(20, items.length * 6)}s` }}>
          {items}
          <span aria-hidden="true" className="ticker__copy">
            {items}
          </span>
        </div>
      </div>
    </div>
  )
}
