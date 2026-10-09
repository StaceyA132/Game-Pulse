import { useState } from 'react'
import { useLiveMoments } from '../hooks/useLiveMoments'
import { POLL_INTERVALS } from '../live/watchGame'
import { StatusBadge } from './StatusBadge'
import { ReplayControls } from './ReplayControls'
import { NotificationFeed } from './NotificationFeed'
import { CaptionFeed } from './CaptionFeed'
import { MomentFeed } from './MomentFeed'

// Everything about the open game: its live status, notifications,
// captions and the full list of moments.
export function GameView({ sport, league, game: selectedGame, date, replay, onStopReplay, onClose }) {
  const [speed, setSpeed] = useState('1x')
  const { game, moments, newMoments, updatedAt, error, loading } = useLiveMoments(sport, league, selectedGame, {
    date,
    replay,
    speed,
  })
  const newIds = new Set(newMoments.map((m) => m.id))
  const interval = POLL_INTERVALS[game.state]

  return (
    <section>
      <h2>Moments: {game.name}</h2>
      <button onClick={onClose}>Close</button>{' '}
      {replay && <ReplayControls speed={speed} onSpeedChange={setSpeed} onStop={onStopReplay} />}
      <p>
        <StatusBadge state={game.state} replay={replay} /> {game.status}
        {!replay && interval && ` · checking every ${interval / 1000}s`}
        {!replay && updatedAt && ` · updated ${updatedAt.toLocaleTimeString()}`}
      </p>
      {!replay && newMoments.length > 0 && <p>🆕 {newMoments.length} new since the last check</p>}
      {loading && <p>Loading…</p>}
      {error && <p>Couldn't update moments: {error}</p>}
      {!loading && !error && moments.length === 0 && <p>{replay ? 'Starting replay…' : 'Nothing has happened yet.'}</p>}

      <NotificationFeed sport={sport} moments={moments} newMoments={newMoments} newIds={newIds} />
      <CaptionFeed sport={sport} league={league} game={game} moments={moments} newIds={newIds} />
      <MomentFeed moments={moments} newIds={newIds} />
    </section>
  )
}
