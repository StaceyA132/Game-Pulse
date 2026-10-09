import { SPORTS } from '../data/sports'
import './SportPicker.css'

// One tab per sport. The selected tab fills with that sport's color.
export function SportPicker({ sport, onSportChange }) {
  return (
    <nav className="sport-tabs" aria-label="Sports">
      <div className="sport-tabs__inner container" role="tablist">
        {SPORTS.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === sport.id}
            className="sport-tab"
            style={{ '--tab-color': s.color, '--tab-ink': s.ink }}
            onClick={() => onSportChange(s.id)}
          >
            <span className="sport-tab__emoji" aria-hidden="true">
              {s.emoji}
            </span>
            {s.name}
          </button>
        ))}
      </div>
    </nav>
  )
}
