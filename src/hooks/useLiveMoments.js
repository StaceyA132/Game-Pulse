import { useEffect, useRef, useState } from 'react'
import { watchGame } from '../live/watchGame'
import { replayGame, REPLAY_SPEEDS } from '../live/replayGame'

// React wrapper around watchGame / replayGame: returns the selected game's
// moments and keeps them updated while it's live or being replayed.
//
// options: { date, replay: boolean, speed: '1x' | '2x' | '4x' }
export function useLiveMoments(sport, league, game, { date = null, replay = false, speed = '1x' } = {}) {
  const key = game ? `${league.path}/${game.id}/${replay ? 'replay' : 'live'}` : null
  const [result, setResult] = useState({ key: null })

  // Kept in a ref so changing speed doesn't restart the replay.
  const delayRef = useRef(REPLAY_SPEEDS[speed])
  useEffect(() => {
    delayRef.current = REPLAY_SPEEDS[speed]
  }, [speed])

  useEffect(() => {
    if (!game) return
    const callbacks = {
      onUpdate: (update) => setResult({ key, error: null, ...update }),
      onError: (err) => setResult((prev) => ({ ...prev, key, error: err.message })),
    }
    return replay
      ? replayGame({ sport, league, game, getDelay: () => delayRef.current, ...callbacks })
      : watchGame({ sport, league, game, date, ...callbacks })
  }, [sport, league, game, date, replay, key])

  // Until the first update for this game finishes, show nothing from the previous one.
  const current = result.key === key ? result : {}
  return {
    game: current.game ?? game,
    moments: current.moments ?? [],
    newMoments: current.newMoments ?? [],
    updatedAt: current.updatedAt ?? null,
    error: current.error ?? null,
    loading: Boolean(game) && !current.updatedAt && !current.error,
  }
}
