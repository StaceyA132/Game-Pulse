export function NotificationCard({ notification, isNew }) {
  return (
    <li
      className={`notification ${notification.major ? 'notification--major' : ''} ${isNew ? 'notification--new' : ''}`}
    >
      <div className="notification__app">
        <svg className="notification__icon" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="7" />
          <path d="M4 17h6l3-8 5 15 3-7h7" />
        </svg>
        <span>GamePulse</span>
        <span className="notification__time">{isNew ? 'now' : notification.clock}</span>
      </div>
      <p className="notification__title">{notification.title}</p>
      <p className="notification__body">{notification.body}</p>
    </li>
  )
}
