import { useEffect, useState } from 'react'
import { SPORTS, getSport, getLeague } from './data/sports'
import { fetchGames } from './api/espn'

const STATE_LABELS = { pre: 'Upcoming', in: '🔴 LIVE', post: 'Final' }

function App() {
  const [sportId, setSportId] = useState(SPORTS[0].id)
  const [leagueId, setLeagueId] = useState(SPORTS[0].leagues[0].id)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const sport = getSport(sportId)
  const league = getLeague(sportId, leagueId)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

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
              <strong>[{STATE_LABELS[game.state]}]</strong> {game.name} — {game.status}
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
