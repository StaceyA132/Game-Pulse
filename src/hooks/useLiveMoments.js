import { useEffect, useState } from 'react'
import { watchGame } from '../live/watchGame'

// React wrapper around watchGame: returns the selected game's moments and
// keeps them updated while it's live.
export function useLiveMoments(sport, league, game) {
  const key = game ? `${league.path}/${game.id}` : null
  const [result, setResult] = useState({ key: null })

  useEffect(() => {
    if (!game) return
    return watchGame({
      sport,
      league,
      game,
      onUpdate: (update) => setResult({ key, error: null, ...update }),
      onError: (err) => setResult((prev) => ({ ...prev, key, error: err.message })),
    })
  }, [sport, league, game, key])

  // Until the first check for this game finishes, show nothing from the previous one.
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
