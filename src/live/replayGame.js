// Replays a finished game as if it were live: loads all its moments once,
// then reveals them one at a time. Updates have the same shape as
// watchGame's, so everything downstream (notifications, captions) treats a
// replay exactly like a live game.

import { getMoments } from '../moments'

// Seconds between moments at each speed.
export const REPLAY_SPEEDS = { '1x': 4000, '2x': 2000, '4x': 1000 }

export function replayGame({ sport, league, game, getDelay, onUpdate, onError }) {
  let stopped = false
  let timer = null

  function update(moments, shown) {
    const done = shown === moments.length
    onUpdate({
      // Present the game as live until the last moment is revealed.
      game: {
        ...game,
        state: done ? 'post' : 'in',
        status: done ? `Replay · ${game.status}` : `Replay · ${shown} of ${moments.length}`,
      },
      moments: moments.slice(0, shown),
      newMoments: shown > 0 ? [moments[shown - 1]] : [],
      updatedAt: new Date(),
    })
  }

  function reveal(moments, shown) {
    if (stopped) return
    update(moments, shown)
    // getDelay is read each time, so changing speed mid-replay takes effect immediately.
    if (shown < moments.length) timer = setTimeout(() => reveal(moments, shown + 1), getDelay())
  }

  getMoments(sport, league, game)
    .then((moments) => reveal(moments, 0))
    .catch((err) => {
      if (!stopped) onError(err)
    })

  return function stop() {
    stopped = true
    clearTimeout(timer)
  }
}
