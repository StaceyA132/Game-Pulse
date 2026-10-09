import { DatePicker } from './DatePicker'
import './LeagueBar.css'

export function LeagueBar({ sport, league, onLeagueChange, date, onDateChange }) {
  return (
    <div className="league-bar">
      <div className="league-bar__leagues" role="group" aria-label="League">
        {sport.leagues.map((l) => (
          <button key={l.id} className="btn" aria-pressed={l.id === league.id} onClick={() => onLeagueChange(l.id)}>
            {l.name}
          </button>
        ))}
      </div>
      <DatePicker date={date} onChange={onDateChange} />
    </div>
  )
}
