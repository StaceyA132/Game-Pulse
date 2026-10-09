import { SPORTS } from '../data/sports'

export function SportPicker({ sport, league, onSportChange, onLeagueChange }) {
  return (
    <section>
      <h2>Sport</h2>
      {SPORTS.map((s) => (
        <button key={s.id} onClick={() => onSportChange(s.id)} disabled={s.id === sport.id}>
          {s.emoji} {s.name}
        </button>
      ))}

      <h2>League</h2>
      {sport.leagues.map((l) => (
        <button key={l.id} onClick={() => onLeagueChange(l.id)} disabled={l.id === league.id}>
          {l.name}
        </button>
      ))}
    </section>
  )
}
