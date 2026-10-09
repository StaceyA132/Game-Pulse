import { useState } from 'react'
import { SPORTS, getSport, getLeague } from './data/sports'
import { useGames } from './hooks/useGames'
import { SportPicker } from './components/SportPicker'
import { DatePicker } from './components/DatePicker'
import { GameList } from './components/GameList'
import { GameView } from './components/GameView'

function App() {
  const [sportId, setSportId] = useState(SPORTS[0].id)
  const [leagueId, setLeagueId] = useState(SPORTS[0].leagues[0].id)
  // 'YYYY-MM-DD', or '' for today.
  const [date, setDate] = useState('')
  // { game, replay } for the open game, or null.
  const [selected, setSelected] = useState(null)

  const sport = getSport(sportId)
  const league = getLeague(sportId, leagueId)
  const { games, loading, error } = useGames(sport, league, date || null)

  // Changing what's listed closes the open game.
  function changeSport(id) {
    setSportId(id)
    setLeagueId(getSport(id).leagues[0].id)
    setSelected(null)
  }

  function changeLeague(id) {
    setLeagueId(id)
    setSelected(null)
  }

  function changeDate(value) {
    setDate(value)
    setSelected(null)
  }

  return (
    <main>
      <h1>GamePulse</h1>
      <SportPicker sport={sport} league={league} onSportChange={changeSport} onLeagueChange={changeLeague} />
      <DatePicker date={date} onChange={changeDate} />

      {selected && (
        <GameView
          // A new key per game/mode starts the view fresh (speed, tone, etc.).
          key={`${league.path}/${selected.game.id}/${selected.replay}`}
          sport={sport}
          league={league}
          game={selected.game}
          date={date || null}
          replay={selected.replay}
          onStopReplay={() => setSelected({ ...selected, replay: false })}
          onClose={() => setSelected(null)}
        />
      )}

      <GameList
        sport={sport}
        league={league}
        date={date}
        games={games}
        loading={loading}
        error={error}
        onOpen={(game, replay) => setSelected({ game, replay })}
      />
    </main>
  )
}

export default App
