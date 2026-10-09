import { useMemo, useState } from 'react'
import { makeNotification, shouldNotify } from '../content/notifications'
import { useBrowserNotifications } from '../hooks/useBrowserNotifications'
import { NotificationCard } from './NotificationCard'
import './NotificationFeed.css'

export function NotificationFeed({ sport, moments, newMoments, newIds }) {
  const [mode, setMode] = useState('major')

  // Newest first, like a notification list.
  const notifications = useMemo(
    () =>
      moments
        .filter((m) => shouldNotify(m, mode))
        .map((m) => makeNotification(sport, m))
        .reverse(),
    [moments, mode, sport],
  )
  // Only brand-new moments pop up as browser notifications, not the game's history.
  const fresh = useMemo(
    () => newMoments.filter((m) => shouldNotify(m, mode)).map((m) => makeNotification(sport, m)),
    [newMoments, mode, sport],
  )
  const browser = useBrowserNotifications(fresh)

  return (
    <section className="panel notification-feed">
      <div className="panel__head">
        <h3 className="panel__title">
          🔔 Alerts <span className="panel__count">{notifications.length}</span>
        </h3>
        <div className="panel__controls">
          <button className="btn" aria-pressed={mode === 'major'} onClick={() => setMode('major')}>
            Major only
          </button>
          <button className="btn" aria-pressed={mode === 'all'} onClick={() => setMode('all')}>
            Everything
          </button>
          {browser.permission === 'default' && (
            <button className="btn btn--accent" onClick={browser.enable}>
              Turn on desktop alerts
            </button>
          )}
          {browser.permission === 'granted' && <span className="panel__note">✓ Desktop alerts on</span>}
          {browser.permission === 'denied' && <span className="panel__note">Desktop alerts blocked in browser</span>}
        </div>
      </div>
      <ul className="panel__body">
        {notifications.length === 0 && <li className="panel__empty">No alerts yet.</li>}
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} isNew={newIds.has(n.momentId)} />
        ))}
      </ul>
    </section>
  )
}
