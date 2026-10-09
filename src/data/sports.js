// Every league GamePulse supports.
// `path` is the ESPN API path: https://site.api.espn.com/apis/site/v2/sports/{path}/scoreboard
// `kind` tells the app how that sport produces "moments":
//   timeline    - a list of match events (goals, cards, tries)
//   scoring     - a list of scoring plays (touchdowns, baskets, runs)
//   leaderboard - player standings that change over time (golf)
//   sets        - set-by-set match scores (tennis)

export const SPORTS = [
  {
    id: 'soccer',
    name: 'Soccer',
    emoji: '⚽',
    kind: 'timeline',
    leagues: [
      { id: 'eng.1', name: 'Premier League', path: 'soccer/eng.1' },
      { id: 'uefa.champions', name: 'Champions League', path: 'soccer/uefa.champions' },
      { id: 'usa.1', name: 'MLS', path: 'soccer/usa.1' },
    ],
  },
  {
    id: 'rugby',
    name: 'Rugby',
    emoji: '🏉',
    kind: 'timeline',
    leagues: [
      { id: '180659', name: 'Six Nations', path: 'rugby/180659' },
      { id: '267979', name: 'Premiership', path: 'rugby/267979' },
      { id: '164205', name: 'Rugby World Cup', path: 'rugby/164205' },
    ],
  },
  {
    id: 'football',
    name: 'Football',
    emoji: '🏈',
    kind: 'scoring',
    leagues: [
      { id: 'nfl', name: 'NFL', path: 'football/nfl' },
      { id: 'college-football', name: 'College Football', path: 'football/college-football' },
    ],
  },
  {
    id: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    kind: 'scoring',
    leagues: [
      { id: 'nba', name: 'NBA', path: 'basketball/nba' },
      { id: 'wnba', name: 'WNBA', path: 'basketball/wnba' },
    ],
  },
  {
    id: 'baseball',
    name: 'Baseball',
    emoji: '⚾',
    kind: 'scoring',
    leagues: [{ id: 'mlb', name: 'MLB', path: 'baseball/mlb' }],
  },
  {
    id: 'hockey',
    name: 'Hockey',
    emoji: '🏒',
    kind: 'scoring',
    leagues: [{ id: 'nhl', name: 'NHL', path: 'hockey/nhl' }],
  },
  {
    id: 'golf',
    name: 'Golf',
    emoji: '⛳',
    kind: 'leaderboard',
    leagues: [{ id: 'pga', name: 'PGA Tour', path: 'golf/pga' }],
  },
  {
    id: 'tennis',
    name: 'Tennis',
    emoji: '🎾',
    kind: 'sets',
    leagues: [
      { id: 'atp', name: 'ATP', path: 'tennis/atp' },
      { id: 'wta', name: 'WTA', path: 'tennis/wta' },
    ],
  },
]

export function getSport(sportId) {
  return SPORTS.find((sport) => sport.id === sportId)
}

export function getLeague(sportId, leagueId) {
  return getSport(sportId)?.leagues.find((league) => league.id === leagueId)
}
