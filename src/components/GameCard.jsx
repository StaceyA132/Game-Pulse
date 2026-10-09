import { StatusBadge } from './StatusBadge'
import { gameStatusText } from './gameStatus'
import './GameCard.css'

// Tennis scores are set-by-set ('6 4 7'), shown as separate boxes.
function Score({ sport, game, competitor }) {
  // No score before the start.
  if (game.state === 'pre') return null
  if (sport.kind === 'sets') {
    const sets = competitor.score ? competitor.score.split(' ') : []
    return (
      <span className="game-card__sets">
        {sets.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </span>
    )
  }
  return <span className="game-card__score">{competitor.score || '–'}</span>
}

export function GameCard({ sport, game, onOpen }) {
  const finished = game.state === 'post'
  const isGolf = sport.kind === 'leaderboard'
  // Golf and tennis list people by full name; team sports use the abbreviation.
  const byName = isGolf || sport.kind === 'sets'

  return (
    <li className={`game-card game-card--${game.state}`}>
      <div className="game-card__top">
        <StatusBadge state={game.state} />
        <span className="game-card__status">{gameStatusText(game)}</span>
      </div>

      {byName && <p className="game-card__event">{game.name}</p>}

      <ol className={`game-card__rows ${byName ? 'game-card__rows--names' : ''}`}>
        {game.competitors.map((c, i) => (
          <li key={i} className={`game-card__row ${finished && !c.winner && !isGolf ? 'game-card__row--lost' : ''}`}>
            {isGolf && <span className="game-card__pos">{i + 1}</span>}
            <span className="game-card__team">
              <span className="game-card__abbr">{byName ? c.name : c.shortName}</span>
              {!byName && <span className="game-card__name">{c.name}</span>}
            </span>
            {c.winner && <span aria-label="Winner">🏆</span>}
            <Score sport={sport} game={game} competitor={c} />
          </li>
        ))}
      </ol>

      <div className="game-card__actions">
        <button className="btn btn--solid" onClick={() => onOpen(game, false)}>
          Match Center →
        </button>
        {finished && (
          <button className="btn" onClick={() => onOpen(game, true)}>
            ⏪ Replay
          </button>
        )}
      </div>
    </li>
  )
}
