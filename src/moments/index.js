// A "moment" is one thing worth telling fans about, in the same shape for every sport:
//
// {
//   id      - stable id, so the same moment isn't announced twice
//   type    - 'score' | 'card' | 'period' | 'final' | 'leader' | 'ace' | 'eagle'
//             | 'birdie' | 'bogey' | 'set' | 'match'
//   label   - short name for it: 'Goal', 'Try', 'Touchdown', 'Eagle', ...
//   major   - true for the big ones (goals, touchdowns, match wins)
//   team    - { name, nickname, shortName, logo } or null, e.g. 'Indianapolis Colts', 'Colts', 'IND'
//   player  - player name or null
//   text    - one-line description of what happened
//   score   - score right after this moment, e.g. 'LEE 1 – 2 ARS', or null
//   clock   - when it happened, e.g. "57'", 'Q3 8:24', 'R2 · Hole 14', 'Set 2'
// }

import { fetchSummary } from '../api/espn'
import { timelineMoments } from './timeline'
import { scoringMoments } from './scoring'
import { golfMoments } from './golf'
import { tennisMoments } from './tennis'

export async function getMoments(sport, league, game) {
  switch (sport.kind) {
    case 'timeline':
      return timelineMoments(sport, game)
    case 'scoring':
      return scoringMoments(sport, game, await fetchSummary(league, game.id))
    case 'leaderboard':
      return golfMoments(game)
    case 'sets':
      return tennisMoments(game)
    default:
      return []
  }
}
