import { useEffect, useMemo, useState } from 'react'
import { SPORTS, getSport, getLeague } from './data/sports'
import { fetchGames } from './api/espn'
import { useLiveMoments } from './hooks/useLiveMoments'
import { POLL_INTERVALS } from './live/watchGame'
import { REPLAY_SPEEDS } from './live/replayGame'
import { makeNotification, shouldNotify } from './content/notifications'
import { useBrowserNotifications } from './hooks/useBrowserNotifications'

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
  const [notifyMode, setNotifyMode] = useState('major')

  const sport = getSport(sportId)
  const league = getLeague(sportId, leagueId)
  const live = useLiveMoments(sport, league, selectedGame, { date: date || null, replay, speed })
  const newIds = new Set(live.newMoments.map((m) => m.id))

  // Newest first, like a phone's notification list.
  const notifications = useMemo(
    () => live.moments.filter((m) => shouldNotify(m, notifyMode)).map((m) => makeNotification(sport, m)).reverse(),
    [live.moments, notifyMode, sport],
  )
  // Only brand-new moments pop up as browser notifications, not the game's history.
  const freshNotifications = useMemo(
    () => live.newMoments.filter((m) => shouldNotify(m, notifyMode)).map((m) => makeNotification(sport, m)),
    [live.newMoments, notifyMode, sport],
  )
  const browser = useBrowserNotifications(freshNotifications)

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
          <h3>🔔 Push notifications ({notifications.length})</h3>
          <p>
            Send:{' '}
            <button onClick={() => setNotifyMode('major')} disabled={notifyMode === 'major'}>
              Major only
            </button>
            <button onClick={() => setNotifyMode('all')} disabled={notifyMode === 'all'}>
              Everything
            </button>{' '}
            {browser.permission === 'default' && <button onClick={browser.enable}>Enable browser alerts</button>}
            {browser.permission === 'granted' && 'Browser alerts on'}
            {browser.permission === 'denied' && 'Browser alerts are blocked in your browser settings'}
          </p>
          <ul>
            {notifications.map((n) => (
              <li key={n.id}>
                {newIds.has(n.momentId) ? '🆕 ' : ''}
                <strong>{n.title}</strong>
                <br />
                {n.body}
              </li>
            ))}
          </ul>

          <h3>All moments ({live.moments.length})</h3>
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
