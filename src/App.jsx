import { useState } from 'react'
import { SPORTS, getSport } from './data/sports'

function App() {
  const [sportId, setSportId] = useState(SPORTS[0].id)
  const [leagueId, setLeagueId] = useState(SPORTS[0].leagues[0].id)

  const sport = getSport(sportId)

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
      {sport.leagues.map((league) => (
        <button key={league.id} onClick={() => setLeagueId(league.id)} disabled={league.id === leagueId}>
          {league.name}
        </button>
      ))}

      <p>
        Selected: {sport.emoji} {sport.name} / {leagueId}
      </p>
    </main>
  )
}

export default App
