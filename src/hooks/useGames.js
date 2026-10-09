import { useEffect, useState } from 'react'
import { fetchGames } from '../api/espn'

// Loads the games for a league on a date ('YYYY-MM-DD', or null for today).
export function useGames(sport, league, date) {
  const key = `${league.path}/${date ?? 'today'}`
  const [result, setResult] = useState({ key: null })

  useEffect(() => {
    let cancelled = false
    fetchGames(sport, league, date)
      .then((games) => {
        if (!cancelled) setResult({ key, games, error: null })
      })
      .catch((err) => {
        if (!cancelled) setResult({ key, games: [], error: err.message })
      })

    // If the user switches league or date before this finishes, ignore its result.
    return () => {
      cancelled = true
    }
  }, [sport, league, date, key])

  // Until this league/date has loaded, show nothing from the previous one.
  const current = result.key === key ? result : null
  return {
    games: current?.games ?? [],
    error: current?.error ?? null,
    loading: !current,
  }
}
