// Keeps a game's moments up to date by re-checking ESPN on a timer, and
// reports which moments are new since the last check.
//
// Moments have stable ids, so "new" just means an id we haven't seen yet.
// The first load counts as history, not news, so it reports no new moments.

import { fetchGames } from '../api/espn'
import { getMoments } from '../moments'

// How often to check, by game state. Finished games don't need checking.
export const POLL_INTERVALS = { in: 20_000, pre: 60_000, post: null }

export function watchGame({ sport, league, game, onUpdate, onError, intervals = POLL_INTERVALS }) {
  const seen = new Set()
  let stopped = false
  let timer = null
  let firstLoad = true

  async function check(current) {
    try {
      // Re-fetch the scoreboard for the latest score and status. If the game has
      // dropped off it (e.g. tennis only lists matches near now), keep what we have.
      const games = await fetchGames(sport, league)
      const latest = games.find((g) => g.id === current.id) ?? current
      const moments = await getMoments(sport, league, latest)
      if (stopped) return

      const newMoments = firstLoad ? [] : moments.filter((m) => !seen.has(m.id))
      moments.forEach((m) => seen.add(m.id))
      firstLoad = false

      onUpdate({ game: latest, moments, newMoments, updatedAt: new Date() })
      scheduleNext(latest)
    } catch (err) {
      if (stopped) return
      onError(err)
      // A failed check shouldn't end live updates; try again next time.
      scheduleNext(current)
    }
  }

  function scheduleNext(current) {
    const delay = intervals[current.state]
    if (delay) timer = setTimeout(() => check(current), delay)
  }

  check(game)

  return function stop() {
    stopped = true
    clearTimeout(timer)
  }
}
