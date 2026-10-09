import { StatusBadge } from './StatusBadge'

export function GameCard({ game, onOpen }) {
  return (
    <li>
      <StatusBadge state={game.state} /> {game.name} — {game.status}{' '}
      <button onClick={() => onOpen(game, false)}>View moments</button>
      {game.state === 'post' && <button onClick={() => onOpen(game, true)}>⏪ Replay</button>}
      <ul>
        {game.competitors.map((c, i) => (
          <li key={i}>
            {c.winner ? '🏆 ' : ''}
            {c.name}: {c.score || '–'}
          </li>
        ))}
      </ul>
    </li>
  )
}
