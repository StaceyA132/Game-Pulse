import { useMemo, useState } from 'react'
import { makeNotification, shouldNotify } from '../content/notifications'
import { useBrowserNotifications } from '../hooks/useBrowserNotifications'
import { NotificationCard } from './NotificationCard'

export function NotificationFeed({ sport, moments, newMoments, newIds }) {
  const [mode, setMode] = useState('major')

  // Newest first, like a phone's notification list.
  const notifications = useMemo(
    () => moments.filter((m) => shouldNotify(m, mode)).map((m) => makeNotification(sport, m)).reverse(),
    [moments, mode, sport],
  )
  // Only brand-new moments pop up as browser notifications, not the game's history.
  const fresh = useMemo(
    () => newMoments.filter((m) => shouldNotify(m, mode)).map((m) => makeNotification(sport, m)),
    [newMoments, mode, sport],
  )
  const browser = useBrowserNotifications(fresh)

  return (
    <section>
      <h3>🔔 Push notifications ({notifications.length})</h3>
      <p>
        Send:{' '}
        <button onClick={() => setMode('major')} disabled={mode === 'major'}>
          Major only
        </button>
        <button onClick={() => setMode('all')} disabled={mode === 'all'}>
          Everything
        </button>{' '}
        {browser.permission === 'default' && <button onClick={browser.enable}>Enable browser alerts</button>}
        {browser.permission === 'granted' && 'Browser alerts on'}
        {browser.permission === 'denied' && 'Browser alerts are blocked in your browser settings'}
      </p>
      <ul>
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} isNew={newIds.has(n.momentId)} />
        ))}
      </ul>
    </section>
  )
}
