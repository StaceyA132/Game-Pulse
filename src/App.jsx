import { useState } from 'react'
import { SPORTS, getSport, getLeague } from './data/sports'
import { useGames } from './hooks/useGames'
import { Header } from './components/Header'
import { Ticker } from './components/Ticker'
import { SportPicker } from './components/SportPicker'
import { LeagueBar } from './components/LeagueBar'
import { GameList } from './components/GameList'
import { GameView } from './components/GameView'
import './App.css'

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

  function openGame(game, replay) {
    setSelected({ game, replay })
    window.scrollTo({ top: 0 })
  }

  return (
    // The selected sport's color flows to everything through these variables.
    <div className="app" style={{ '--accent': sport.color, '--accent-ink': sport.ink }}>
      <Ticker league={league} games={games} />
      <Header />
      <SportPicker sport={sport} onSportChange={changeSport} />

      <main className="page container">
        {selected ? (
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
        ) : (
          <>
            <LeagueBar
              sport={sport}
              league={league}
              onLeagueChange={changeLeague}
              date={date}
              onDateChange={changeDate}
            />
            <GameList
              sport={sport}
              league={league}
              date={date}
              games={games}
              loading={loading}
              error={error}
              onOpen={openGame}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App
