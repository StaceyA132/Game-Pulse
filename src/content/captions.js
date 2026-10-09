// Turns a moment into a social media post (X / Instagram style), in one of
// three tones, with hashtags. Built on top of the notification so the facts
// always match what fans were alerted about.
//
// { id, momentId, tone, text }

import { makeNotification } from './notifications'

export const TONES = {
  hype: '🔥 Hype',
  analyst: '📊 Analyst',
  funny: '😂 Funny',
}

const POST_LIMIT = 280
const MAX_HASHTAGS = 4

// Same idea as in notifications: a stable choice per moment.
function pick(id, options) {
  let hash = 7
  for (const char of id) hash = (hash * 33 + char.charCodeAt(0)) >>> 0
  return options[hash % options.length]
}

// Groups moments by the kind of post they need.
function categoryOf(moment) {
  if (['final', 'match'].includes(moment.type)) return 'final'
  if (['card', 'bogey'].includes(moment.type)) return 'setback'
  if (['leader', 'set', 'period'].includes(moment.type)) return 'update'
  return 'score'
}

// Templates get: title, label, fact, who (team or player), opp (the other
// side), lead (e.g. 'Colts now lead by 4.'), emoji and hasTeam.
const TEMPLATES = {
  hype: {
    score: [
      (v) => `${v.title} 🔥🔥🔥\n\n${v.fact}`,
      (v) => `ARE YOU SERIOUS?! 😱\n\n${v.fact}`,
      (v) => `LET'S GOOOO ${v.who.toUpperCase()} 🙌\n\n${v.fact}`,
    ],
    final: [
      (v) => `IT'S OVER! 🏆 ${v.title.replace(/^\S+\s/, '')}\n\n${v.fact}`,
      (v) => `BALLGAME. ${v.who.toUpperCase()} GET IT DONE 🔒\n\n${v.fact}`,
    ],
    setback: [(v) => `OH NO 😬 ${v.title.replace(/^\S+\s/, '')}\n\n${v.fact}`],
    update: [(v) => `${v.title} 👀\n\n${v.fact}`],
  },
  analyst: {
    score: [(v) => `${v.emoji} ${v.label}, ${v.who}.\n\n${v.fact}${v.lead ? `\n\n${v.lead}` : ''}`],
    final: [(v) => `${v.hasTeam ? `Final: ${v.who} win.` : 'Final.'}\n\n${v.fact}${v.lead ? `\n\n${v.lead}` : ''}`],
    setback: [(v) => `${v.emoji} ${v.label}, ${v.who}.\n\n${v.fact}`],
    update: [(v) => `${v.title}\n\n${v.fact}`],
  },
  funny: {
    score: [
      (v) => `Somebody check on ${v.opp === 'the field' ? 'the rest of the leaderboard' : v.opp} 💀\n\n${v.fact}`,
      (v) => `${v.who} said "not today" 😤\n\n${v.fact}`,
      (v) => `The group chat is going OFF right now 📱📱📱\n\n${v.fact}`,
    ],
    final: [
      (v) =>
        v.opp === 'the field'
          ? `${v.who}: 📈\nRest of the field: 📉\n\n${v.fact}`
          : `${v.opp} fans, it's ok to log off now 😭\n\n${v.fact}`,
      (v) =>
        v.opp === 'the field'
          ? `${v.who} really said "thanks for coming, everyone" 🏆\n\n${v.fact}`
          : `Pack it up, ${v.opp}. ${v.who} take${v.hasTeam ? '' : 's'} this one 🧳\n\n${v.fact}`,
    ],
    setback: [(v) => `Not the vibe 🫠\n\n${v.fact}`],
    update: [(v) => `Quick vibe check ${v.emoji}\n\n${v.fact}`],
  },
}

// Draws (no winner) don't have a winner and loser to joke about.
const DRAW_TEMPLATES = {
  hype: (v) => `ALL SQUARE AT THE WHISTLE 🤝\n\n${v.fact}`,
  analyst: (v) => `Final. Honours even.\n\n${v.fact}`,
  funny: (v) => `Nobody won. Nobody lost. Everybody is mad 🙃\n\n${v.fact}`,
}

function toHashtag(text) {
  const clean = text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '')
  return clean ? `#${clean}` : null
}

function hashtagsFor(league, moment, game) {
  const tags = [league.hashtag]
  const teams = game.competitors.filter((c) => c.nickname)
  if (teams.length === 2) {
    // Scoring team first, then the matchup tag: #Colts #INDvsWSH
    const scorer = teams.find((t) => t.nickname === moment.team?.nickname)
    if (scorer) tags.push(toHashtag(scorer.nickname))
    tags.push(`#${teams[0].shortName}vs${teams[1].shortName}`)
  } else if (moment.player) {
    // Golf and tennis: tag the player(s).
    moment.player.split(' and ').forEach((name) => tags.push(toHashtag(name)))
  }
  return [...new Set(tags.filter(Boolean))].slice(0, MAX_HASHTAGS)
}

// 'IND 17 – 13 WSH' -> 'Colts now lead by 4.'
function leadLine(moment, game) {
  const match = /^(\S+) (\d+) – (\d+) (\S+)$/.exec(moment.score ?? '')
  if (!match) return null
  const [, first, a, b, second] = match
  const diff = Number(a) - Number(b)
  if (diff === 0) return 'All square.'
  const leaderCode = diff > 0 ? first : second
  const leader = game.competitors.find((c) => c.shortName === leaderCode)
  const name = leader?.nickname ?? leaderCode
  return moment.type === 'final'
    ? `Winning margin: ${Math.abs(diff)}.`
    : `${name} ${moment.team?.nickname === name ? 'now lead' : 'still lead'} by ${Math.abs(diff)}.`
}

function opponentOf(moment, game) {
  // Golf has a whole leaderboard, not one opponent.
  if (game.competitors.length !== 2) return 'the field'
  const other = game.competitors.find((c) => (c.nickname ?? c.name) !== (moment.team?.nickname ?? moment.player))
  return other?.nickname ?? other?.name ?? 'the field'
}

export function makeCaption(sport, league, game, moment, tone = 'hype') {
  const notification = makeNotification(sport, moment)
  const vars = {
    title: notification.title,
    label: moment.label,
    fact: notification.body,
    hasTeam: Boolean(moment.team),
    who: moment.team?.nickname ?? moment.player ?? game.name,
    opp: opponentOf(moment, game),
    lead: leadLine(moment, game),
    emoji: sport.emoji,
  }

  const isDraw = moment.type === 'final' && !moment.team && game.competitors.length === 2 && sport.id !== 'golf'
  const template = isDraw
    ? DRAW_TEMPLATES[tone]
    : pick(`${moment.id}-${tone}`, TEMPLATES[tone][categoryOf(moment)])

  const body = template(vars)
  let tags = hashtagsFor(league, moment, game)
  // Keep the whole post within X's limit, dropping hashtags first.
  while (tags.length && `${body}\n\n${tags.join(' ')}`.length > POST_LIMIT) tags = tags.slice(0, -1)
  const text = tags.length ? `${body}\n\n${tags.join(' ')}` : body.slice(0, POST_LIMIT)

  return { id: `caption-${moment.id}-${tone}`, momentId: moment.id, tone, text }
}
