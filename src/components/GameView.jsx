import { useState } from 'react'
import { useLiveMoments } from '../hooks/useLiveMoments'
import { POLL_INTERVALS } from '../live/watchGame'
import { MatchHeader } from './MatchHeader'
import { ReplayControls } from './ReplayControls'
import { NotificationFeed } from './NotificationFeed'
import { CaptionFeed } from './CaptionFeed'
import { MomentFeed } from './MomentFeed'
import './GameView.css'

const PANELS = [
  { id: 'alerts', label: '🔔 Alerts' },
  { id: 'posts', label: '💬 Posts' },
  { id: 'timeline', label: '⏱️ Timeline' },
]

// The Match Center: scoreboard on top, then alerts, social posts and the
// timeline side by side (as tabs on narrow screens).
export function GameView({ sport, league, game: selectedGame, date, replay, onStopReplay, onClose }) {
  const [speed, setSpeed] = useState('1x')
  const [panel, setPanel] = useState('alerts')
  const { game, moments, newMoments, updatedAt, error, loading } = useLiveMoments(sport, league, selectedGame, {
    date,
    replay,
    speed,
  })
  const newIds = new Set(newMoments.map((m) => m.id))
  const interval = POLL_INTERVALS[game.state]

  return (
    <div className="game-view">
      <div className="game-view__bar">
        <button className="btn" onClick={onClose}>
          ← All games
        </button>
        {replay ? (
          <ReplayControls speed={speed} onSpeedChange={setSpeed} onStop={onStopReplay} />
        ) : (
          <span className="game-view__updated">
            {interval ? `Checking every ${interval / 1000}s` : 'Final result'}
            {updatedAt &&
              ` · updated ${updatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`}
            {newMoments.length > 0 && ` · ${newMoments.length} new`}
          </span>
        )}
      </div>

      <MatchHeader sport={sport} league={league} game={game} moments={moments} replay={replay} />

      {loading && <p className="game-view__message">Loading moments…</p>}
      {error && <p className="game-view__message">Couldn't update moments: {error}</p>}
      {!loading && !error && moments.length === 0 && (
        <p className="game-view__message">
          {replay ? 'Starting replay…' : 'Nothing has happened yet. New moments will appear here automatically.'}
        </p>
      )}

      {moments.length > 0 && (
        <>
          <div className="game-view__tabs" role="tablist" aria-label="Match Center panels">
            {PANELS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={panel === p.id}
                className="game-view__tab"
                onClick={() => setPanel(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="game-view__panels" data-panel={panel}>
            <NotificationFeed sport={sport} moments={moments} newMoments={newMoments} newIds={newIds} />
            <CaptionFeed sport={sport} league={league} game={game} moments={moments} newIds={newIds} />
            <MomentFeed sport={sport} moments={moments} newIds={newIds} />
          </div>
        </>
      )}
    </div>
  )
}
