import { useEffect, useRef, useState } from 'react'

const supported = typeof window !== 'undefined' && 'Notification' in window

// Shows real browser notifications for the given list, once each, after the
// user has allowed them.
export function useBrowserNotifications(notifications) {
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported')
  const sent = useRef(new Set())

  async function enable() {
    if (supported) setPermission(await Notification.requestPermission())
  }

  useEffect(() => {
    if (permission !== 'granted') return
    for (const n of notifications) {
      if (sent.current.has(n.id)) continue
      sent.current.add(n.id)
      new Notification(n.title, { body: n.body, tag: n.id })
    }
  }, [notifications, permission])

  return { permission, enable }
}
