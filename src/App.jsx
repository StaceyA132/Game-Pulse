import { useEffect, useState } from 'react'
import { SPORTS, getSport, getLeague } from './data/sports'
import { fetchGames } from './api/espn'
import { getMoments } from './moments'

const STATE_LABELS = { pre: 'Upcoming', in: '🔴 LIVE', post: 'Final' }

function App() {
  const [sportId, setSportId] = useState(SPORTS[0].id)
  const [leagueId, setLeagueId] = useState(SPORTS[0].leagues[0].id)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedGame, setSelectedGame] = useState(null)
  const [moments, setMoments] = useState([])
  const [momentsLoading, setMomentsLoading] = useState(false)
  const [momentsError, setMomentsError] = useState(null)

  const sport = getSport(sportId)
  const league = getLeague(sportId, leagueId)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setSelectedGame(null)

    fetchGames(sport, league)
      .then((result) => {
        if (!cancelled) setGames(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // If the user switches league before this request finishes, ignore its result.
    return () => {
      cancelled = true
    }
  }, [sport, league])

  useEffect(() => {
    if (!selectedGame) return
    let cancelled = false
    setMoments([])
    setMomentsLoading(true)
    setMomentsError(null)

    getMoments(sport, league, selectedGame)
      .then((result) => {
        if (!cancelled) setMoments(result)
      })
      .catch((err) => {
        if (!cancelled) setMomentsError(err.message)
      })
      .finally(() => {
        if (!cancelled) setMomentsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sport, league, selectedGame])

  function pickSport(id) {
    setSportId(id)
    setLeagueId(getSport(id).leagues[0].id)
  }

  return (
    <main>
      <h1>GamePulse</h1>

      <h2>Sport</h2>
      {SPORTS.map((s) => (
        <button key={s.id} onClick={() => pickSport(s.id)} disabled={s.id === sportId}>
          {s.emoji} {s.name}
        </button>
      ))}

      <h2>League</h2>
      {sport.leagues.map((l) => (
        <button key={l.id} onClick={() => setLeagueId(l.id)} disabled={l.id === leagueId}>
          {l.name}
        </button>
      ))}

      {selectedGame && (
        <section>
          <h2>Moments: {selectedGame.name}</h2>
          <button onClick={() => setSelectedGame(null)}>Close</button>
          {momentsLoading && <p>Loading…</p>}
          {momentsError && <p>Couldn't load moments: {momentsError}</p>}
          {!momentsLoading && !momentsError && moments.length === 0 && <p>Nothing has happened yet.</p>}
          <ol>
            {moments.map((m) => (
              <li key={m.id}>
                [{m.clock}] {m.major ? '⭐ ' : ''}
                <strong>{m.label}</strong> — {m.text}
                {m.score && ` (${m.score})`}
              </li>
            ))}
          </ol>
        </section>
      )}

      <h2>
        {sport.emoji} {league.name} games
      </h2>
      {loading && <p>Loading…</p>}
      {error && <p>Couldn't load games: {error}</p>}
      {!loading && !error && games.length === 0 && <p>No games today.</p>}
      {!loading && !error && (
        <ul>
          {games.map((game) => (
            <li key={game.id}>
              <strong>[{STATE_LABELS[game.state]}]</strong> {game.name} — {game.status}{' '}
              <button onClick={() => setSelectedGame(game)}>View moments</button>
              <ul>
                {game.competitors.map((c, i) => (
                  <li key={i}>
                    {c.winner ? '🏆 ' : ''}
                    {c.name}: {c.score || '–'}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
