export function NotificationCard({ notification, isNew }) {
  return (
    <li>
      {isNew ? '🆕 ' : ''}
      <strong>{notification.title}</strong>
      <br />
      {notification.body}
    </li>
  )
}
