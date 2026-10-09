import { GameCard } from './GameCard'

export function GameList({ sport, league, date, games, loading, error, onOpen }) {
  return (
    <section>
      <h2>
        {sport.emoji} {league.name} games {date ? `on ${date}` : 'today'}
      </h2>
      {loading && <p>Loading…</p>}
      {error && <p>Couldn't load games: {error}</p>}
      {!loading && !error && games.length === 0 && <p>No games on this date.</p>}
      <ul>
        {games.map((game) => (
          <GameCard key={game.id} game={game} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  )
}
