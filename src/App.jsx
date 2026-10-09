import { useEffect, useState } from 'react'
import { SPORTS, getSport, getLeague } from './data/sports'
import { fetchGames } from './api/espn'
import { useLiveMoments } from './hooks/useLiveMoments'
import { POLL_INTERVALS } from './live/watchGame'
import { REPLAY_SPEEDS } from './live/replayGame'

const STATE_LABELS = { pre: 'Upcoming', in: '🔴 LIVE', post: 'Final' }

function App() {
  const [sportId, setSportId] = useState(SPORTS[0].id)
  const [leagueId, setLeagueId] = useState(SPORTS[0].leagues[0].id)
  // 'YYYY-MM-DD', or '' for today.
  const [date, setDate] = useState('')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedGame, setSelectedGame] = useState(null)
  const [replay, setReplay] = useState(false)
  const [speed, setSpeed] = useState('1x')

  const sport = getSport(sportId)
  const league = getLeague(sportId, leagueId)
  const live = useLiveMoments(sport, league, selectedGame, { date: date || null, replay, speed })
  const newIds = new Set(live.newMoments.map((m) => m.id))

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setSelectedGame(null)

    fetchGames(sport, league, date || null)
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
  }, [sport, league, date])

  function pickSport(id) {
    setSportId(id)
    setLeagueId(getSport(id).leagues[0].id)
  }

  function openGame(game, asReplay) {
    setSelectedGame(game)
    setReplay(asReplay)
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

      <h2>Date</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />{' '}
      <button onClick={() => setDate('')} disabled={!date}>
        Today
      </button>

      {selectedGame && (
        <section>
          <h2>Moments: {live.game.name}</h2>
          <button onClick={() => setSelectedGame(null)}>Close</button>
          {replay && (
            <>
              {' '}
              Speed:{' '}
              {Object.keys(REPLAY_SPEEDS).map((s) => (
                <button key={s} onClick={() => setSpeed(s)} disabled={s === speed}>
                  {s}
                </button>
              ))}{' '}
              <button onClick={() => setReplay(false)}>Stop replay</button>
            </>
          )}
          <p>
            [{replay ? '⏪ REPLAY' : STATE_LABELS[live.game.state]}] {live.game.status}
            {!replay && POLL_INTERVALS[live.game.state] && ` · checking every ${POLL_INTERVALS[live.game.state] / 1000}s`}
            {!replay && live.updatedAt && ` · updated ${live.updatedAt.toLocaleTimeString()}`}
          </p>
          {!replay && live.newMoments.length > 0 && <p>🆕 {live.newMoments.length} new since the last check</p>}
          {live.loading && <p>Loading…</p>}
          {live.error && <p>Couldn't update moments: {live.error}</p>}
          {!live.loading && !live.error && live.moments.length === 0 && (
            <p>{replay ? 'Starting replay…' : 'Nothing has happened yet.'}</p>
          )}
          <ol>
            {live.moments.map((m) => (
              <li key={m.id}>
                {newIds.has(m.id) ? '🆕 ' : ''}[{m.clock}] {m.major ? '⭐ ' : ''}
                <strong>{m.label}</strong> — {m.text}
                {m.score && ` (${m.score})`}
              </li>
            ))}
          </ol>
        </section>
      )}

      <h2>
        {sport.emoji} {league.name} games {date ? `on ${date}` : 'today'}
      </h2>
      {loading && <p>Loading…</p>}
      {error && <p>Couldn't load games: {error}</p>}
      {!loading && !error && games.length === 0 && <p>No games on this date.</p>}
      {!loading && !error && (
        <ul>
          {games.map((game) => (
            <li key={game.id}>
              <strong>[{STATE_LABELS[game.state]}]</strong> {game.name} — {game.status}{' '}
              <button onClick={() => openGame(game, false)}>View moments</button>
              {game.state === 'post' && <button onClick={() => openGame(game, true)}>⏪ Replay</button>}
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
