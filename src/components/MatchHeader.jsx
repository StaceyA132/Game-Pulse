import { StatusBadge } from './StatusBadge'
import './MatchHeader.css'

// 'IRE 5 – 0 SCO' -> { IRE: '5', SCO: '0' }
function parseScore(text) {
  const match = /^(\S+) (\d+) – (\d+) (\S+)$/.exec(text ?? '')
  return match ? { [match[1]]: match[2], [match[4]]: match[3] } : null
}

// During a replay the game object already holds the final score, so take the
// score from the latest revealed moment instead (no spoilers).
function displayScores(game, moments, replay) {
  if (!replay || game.state === 'post') return game.competitors.map((c) => c.score)
  const latest = [...moments]
    .reverse()
    .map((m) => parseScore(m.score))
    .find(Boolean)
  return game.competitors.map((c) => (latest ? (latest[c.shortName] ?? '0') : '0'))
}

export function MatchHeader({ sport, league, game, moments, replay }) {
  const isTeamGame = sport.kind === 'timeline' || sport.kind === 'scoring'
  const scores = displayScores(game, moments, replay)

  return (
    <section className="match-header">
      <div className="match-header__meta">
        <StatusBadge state={game.state} replay={replay} />
        <span>
          {sport.emoji} {league.name}
        </span>
        <span className="match-header__status">{game.status}</span>
      </div>

      {isTeamGame ? (
        <div className="match-header__board">
          {game.competitors.map((c, i) => (
            <div key={c.id} className={`match-header__side match-header__side--${i === 0 ? 'left' : 'right'}`}>
              <span className="match-header__abbr">{c.shortName}</span>
              <span className="match-header__name">{c.name}</span>
            </div>
          ))}
          <div className="match-header__score" aria-label="Score">
            {/* Keyed by value so the number flashes whenever it changes. */}
            <span key={`a-${scores[0]}`}>{scores[0] || 0}</span>
            <span className="match-header__dash">–</span>
            <span key={`b-${scores[1]}`}>{scores[1] || 0}</span>
          </div>
        </div>
      ) : (
        <div className="match-header__event">
          <h2>{game.name}</h2>
          <ol>
            {game.competitors.map((c, i) => (
              <li key={c.id ?? i}>
                {sport.kind === 'leaderboard' && <span className="match-header__pos">{i + 1}</span>}
                <span>{c.name}</span>
                {/* Golf/tennis replays hide the result until the end. */}
                <strong>{replay && game.state !== 'post' ? '' : c.score}</strong>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
