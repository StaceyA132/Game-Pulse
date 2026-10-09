import { GameCard } from './GameCard'
import './GameList.css'

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function GameList({ sport, league, date, games, loading, error, onOpen }) {
  const liveCount = games.filter((g) => g.state === 'in').length

  return (
    <section className="game-list">
      <div className="game-list__heading">
        <h2>
          {league.name} <span>· {date ? formatDate(date) : 'Today'}</span>
        </h2>
        {!loading && !error && (
          <p>
            {games.length} {sport.kind === 'leaderboard' ? 'tournament' : 'game'}
            {games.length === 1 ? '' : 's'}
            {liveCount > 0 && ` · ${liveCount} live now`}
          </p>
        )}
      </div>

      {loading && <p className="game-list__message">Loading games…</p>}
      {error && <p className="game-list__message">Couldn't load games: {error}</p>}
      {!loading && !error && games.length === 0 && (
        <p className="game-list__message">
          No {sport.name.toLowerCase()} on this date. Try another day with the date picker.
        </p>
      )}

      <ul className="game-list__grid">
        {games.map((game) => (
          <GameCard key={game.id} sport={sport} game={game} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  )
}
