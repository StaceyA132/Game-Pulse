import { REPLAY_SPEEDS } from '../live/replayGame'

export function ReplayControls({ speed, onSpeedChange, onStop }) {
  return (
    <div className="replay-controls" role="group" aria-label="Replay speed">
      {Object.keys(REPLAY_SPEEDS).map((s) => (
        <button key={s} className="btn" aria-pressed={s === speed} onClick={() => onSpeedChange(s)}>
          {s}
        </button>
      ))}
      <button className="btn btn--accent" onClick={onStop}>
        ⏭ Skip to end
      </button>
    </div>
  )
}
