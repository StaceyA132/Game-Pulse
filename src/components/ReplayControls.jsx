import { REPLAY_SPEEDS } from '../live/replayGame'

export function ReplayControls({ speed, onSpeedChange, onStop }) {
  return (
    <span>
      Speed:{' '}
      {Object.keys(REPLAY_SPEEDS).map((s) => (
        <button key={s} onClick={() => onSpeedChange(s)} disabled={s === speed}>
          {s}
        </button>
      ))}{' '}
      <button onClick={onStop}>Stop replay</button>
    </span>
  )
}
