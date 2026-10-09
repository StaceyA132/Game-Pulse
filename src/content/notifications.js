// Turns a moment into a push notification: a short, urgent title and a
// one-line body, the way a sports app alerts fans on their lock screen.
//
// { id, momentId, title, body, major }

const TITLE_LIMIT = 50
const BODY_LIMIT = 140

// Pick one of several phrasings. Based on the moment id, so the same moment
// always gets the same wording.
function pick(id, options) {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return options[hash % options.length]
}

function truncate(text, limit) {
  return text.length <= limit ? text : `${text.slice(0, limit - 1).trimEnd()}…`
}

// 'IND 7 – 6 WSH (Q2 3:23)'
function scoreAndClock(moment) {
  const clock = moment.clock && moment.clock !== 'Final' ? `(${moment.clock})` : ''
  return [moment.score, clock].filter(Boolean).join(' ')
}

function sentence(...parts) {
  return parts.filter(Boolean).join(' ')
}

// Hockey play text looks like 'Carter Verhaeghe Goal (25) Snap Shot, assists: ...'
function hockeyGoal(text) {
  const match = /^(.+?) Goal \((\d+)\) ([^,]+)/.exec(text)
  return match ? `${match[1]} scores on a ${match[3].toLowerCase()}, goal #${match[2]} on the season.` : `${text}.`
}

// NFL play text looks like 'Jonathan Taylor 5 Yd Rush (Spencer Shrader Kick)'.
// Rewrite the common patterns into plain English: 'Jonathan Taylor 5-yard run'.
function footballPlay(text) {
  return text
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/(\d+) Yd pass from (.+)/, '$1-yard catch from $2')
    .replace(/(\d+) Yd Rush/, '$1-yard run')
    .replace(/(\d+) Yd Field Goal/, 'from $1 yards')
    .replace(/(\d+) Yd (Interception|Fumble) Return/, (_, yards, kind) => `${yards}-yard ${kind.toLowerCase()} return`)
    .trim()
}

// Each template returns { title, body } for one kind of moment.
// `nick` is the team's short name ('Colts'), `NICK` the same in capitals.
const TEMPLATES = {
  // Soccer
  Goal: (m, { nick, NICK, emoji }) => ({
    title: pick(m.id, [`${emoji} GOAL! ${NICK}`, `${emoji} ${NICK} SCORE!`, `${emoji} It's in for ${nick}!`]),
    body: sentence(`${m.player ?? nick} finds the net.`, scoreAndClock(m)),
  }),
  'Penalty goal': (m, { nick, NICK, emoji, sportId }) =>
    sportId === 'rugby'
      ? { title: `${emoji} Penalty: ${nick} +3`, body: sentence(`${m.player} slots the penalty.`, scoreAndClock(m)) }
      : { title: `${emoji} PENALTY SCORED, ${NICK}`, body: sentence(`${m.player} converts from the spot.`, scoreAndClock(m)) },
  'Own goal': (m, { nick, emoji }) => ({
    title: `${emoji} OWN GOAL!`,
    body: sentence(`${m.player} turns it into their own net. Gift for ${nick}.`, scoreAndClock(m)),
  }),
  'Shootout penalty': (m, { nick, emoji }) => ({
    title: `${emoji} Shootout: ${nick} score`,
    body: sentence(`${m.player} converts in the shootout.`, scoreAndClock(m)),
  }),
  'Red card': (m, { nick }) => ({
    title: `🟥 RED CARD, ${nick}`,
    body: sentence(`${m.player ?? nick} is sent off.`, scoreAndClock(m)),
  }),
  'Yellow card': (m, { nick }) => ({
    title: `🟨 Yellow card, ${nick}`,
    body: sentence(`${m.player ?? nick} goes into the book.`, scoreAndClock(m)),
  }),

  // Rugby
  Try: (m, { nick, NICK, emoji }) => ({
    title: pick(m.id, [`${emoji} TRY ${NICK}!`, `${emoji} ${NICK} GO OVER!`, `${emoji} Try time for ${nick}`]),
    body: sentence(`${m.player ?? nick} touches down.`, scoreAndClock(m)),
  }),
  'Penalty try': (m, { NICK, emoji }) => ({
    title: `${emoji} PENALTY TRY, ${NICK}`,
    body: sentence('Seven points awarded.', scoreAndClock(m)),
  }),
  Conversion: (m, { nick, emoji }) => ({
    title: `${emoji} Conversion: ${nick} +2`,
    body: sentence(`${m.player} adds the extras.`, scoreAndClock(m)),
  }),
  'Drop goal': (m, { nick, emoji }) => ({
    title: `${emoji} DROP GOAL, ${nick}!`,
    body: sentence(`${m.player} drops it over.`, scoreAndClock(m)),
  }),

  // Football
  'Passing Touchdown': (m, ctx) => touchdown(m, ctx),
  'Rushing Touchdown': (m, ctx) => touchdown(m, ctx),
  'Interception Return Touchdown': (m, ctx) => touchdown(m, ctx, 'PICK-SIX'),
  'Fumble Return Touchdown': (m, ctx) => touchdown(m, ctx, 'SCOOP AND SCORE'),
  'Field Goal': (m, { nick, emoji }) => ({
    title: `${emoji} Field goal, ${nick}`,
    body: sentence(`${footballPlay(m.text)}.`, scoreAndClock(m)),
  }),
  Safety: (m, { NICK, emoji }) => ({ title: `${emoji} SAFETY, ${NICK}`, body: sentence('Two points.', scoreAndClock(m)) }),

  // Basketball
  'Clutch three': (m, { NICK, emoji }) => ({
    title: pick(m.id, [`${emoji} CLUTCH THREE, ${NICK}!`, `${emoji} BANG! ${NICK} from deep`]),
    body: sentence(`${m.text}.`, scoreAndClock(m)),
  }),
  'Lead change': (m, { nick, emoji }) => ({
    title: `${emoji} ${nick} take the lead`,
    body: sentence(`${m.text}.`, scoreAndClock(m)),
  }),
  Dunk: (m, { nick, emoji }) => ({ title: `${emoji} Slam! ${nick}`, body: sentence(`${m.text}.`, scoreAndClock(m)) }),

  // Baseball
  'Home run': (m, { NICK, emoji }) => ({
    title: pick(m.id, [`${emoji} HOME RUN ${NICK}!`, `${emoji} GONE! ${NICK} go deep`]),
    body: sentence(m.text, scoreAndClock(m)),
  }),
  'Run scores': (m, { nick, emoji }) => ({ title: `${emoji} Run scores, ${nick}`, body: sentence(m.text, scoreAndClock(m)) }),

  // Golf
  'Hole-in-one': (m, { emoji }) => ({
    title: `${emoji} HOLE-IN-ONE!`,
    body: sentence(`${m.player} aces it. Now ${m.score.split(' ').pop()}.`, `(${m.clock})`),
  }),
  Eagle: (m) => ({
    title: `🦅 EAGLE for ${m.player}`,
    body: sentence(`${m.text}. Now ${m.score.split(' ').pop()}.`, `(${m.clock})`),
  }),
  Albatross: (m) => ({
    title: `🪶 ALBATROSS for ${m.player}!`,
    body: sentence(`${m.text}. Now ${m.score.split(' ').pop()}.`, `(${m.clock})`),
  }),
  'Birdie streak': (m) => ({ title: `🔥 ${m.player} is heating up`, body: sentence(`${m.text}.`, `(${m.clock})`) }),
  'Double bogey': (m) => ({ title: `😬 Trouble for ${m.player}`, body: sentence(`${m.text}.`, `(${m.clock})`) }),
  'Triple bogey or worse': (m) => ({ title: `😱 Disaster for ${m.player}`, body: sentence(`${m.text}.`, `(${m.clock})`) }),
  Leader: (m, { emoji }) => ({ title: `${emoji} ${m.player} leads`, body: `${m.text}.` }),
  'Tied for the lead': (m, { emoji }) => ({ title: `${emoji} Logjam at the top`, body: `${m.text}.` }),
  Winner: (m) => ({ title: `🏆 ${m.player.toUpperCase()} WINS`, body: `${m.text}.` }),
  Playoff: (m, { emoji }) => ({ title: `${emoji} PLAYOFF!`, body: `${m.text}. Extra holes coming.` }),

  // Tennis
  'Set won': (m, { emoji }) => ({ title: `${emoji} Set to ${m.player}`, body: sentence(`${m.text}.`, m.score) }),
  'Match won': (m, { emoji }) => ({
    title: pick(m.id, [`${emoji} ${m.player} wins!`, `${emoji} Game, set, match: ${m.player}`]),
    body: `${m.text}.`,
  }),

  // Every sport
  'End of period': (m, { emoji }) => ({ title: `${emoji} ${m.text}`, body: m.score }),
  Final: (m, { emoji }) => ({
    title: m.team ? `${emoji} FINAL: ${m.team.nickname} win` : `${emoji} FINAL: All square`,
    body: m.score,
  }),
}

function touchdown(m, { NICK, emoji }, headline = 'TOUCHDOWN') {
  return {
    title: pick(m.id, [`${emoji} ${headline} ${NICK}!`, `${emoji} ${headline}! ${NICK}`]),
    body: sentence(`${footballPlay(m.text)}.`, scoreAndClock(m)),
  }
}

// Used for any moment without its own template.
function fallback(m, { emoji }) {
  return { title: `${emoji} ${m.label}`, body: sentence(`${m.text}.`, scoreAndClock(m)) }
}

export function makeNotification(sport, moment) {
  const nick = moment.team?.nickname ?? moment.team?.name ?? ''
  const ctx = { nick, NICK: nick.toUpperCase(), emoji: sport.emoji, sportId: sport.id }

  // Hockey goals have their own wording, not soccer's.
  const template = sport.id === 'hockey' && moment.label === 'Goal' ? hockeyTemplate : TEMPLATES[moment.label] ?? fallback
  const { title, body } = template(moment, ctx)

  return {
    id: `notification-${moment.id}`,
    momentId: moment.id,
    title: truncate(title, TITLE_LIMIT),
    body: truncate(body ?? '', BODY_LIMIT),
    major: moment.major,
  }
}

function hockeyTemplate(m, { NICK }) {
  return {
    title: pick(m.id, [`🚨 GOAL ${NICK}!`, `🚨 ${NICK} SCORE!`]),
    body: sentence(hockeyGoal(m.text), scoreAndClock(m)),
  }
}

// 'major' sends only the big moments; 'all' sends everything.
export function shouldNotify(moment, mode = 'major') {
  return mode === 'all' || moment.major
}
