const bot = require('../core')
const { exec } = require('child_process')

const aoc_sess = bot.mem.load('env').aoc_sess

module.exports = async ctx => {

   let query = ctx.message.text.split(' ').slice(1).join(' ')
   fetch(ctx, query || new Date().getFullYear())

}

let fetch = async (ctx, y) => {

   let aoc_addr = 'https://adventofcode.com/'+y+'/leaderboard/private/view/983136.json'
   let aoc_comm = 'curl -s --cookie "session='+aoc_sess+'" '+aoc_addr

   exec (aoc_comm, (error, stdout, stderr) => {
      let r = {}
      if (error) {
         console.error(error)
         return run(':(')
      }
      if (stderr) {
         console.error(stderr)
         return run(':(')
      }
      try {
         r = JSON.parse(stdout)
      } catch (err) {
         r = {}
      }
      return run(ctx, r)
   })

}

let run = (ctx, data) => {

   if (!Object.keys(data).length) {
      ctx.reply(':(')
      return null
   }

   let $ = Object.values
   let fmt = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZone: 'Europe/Lisbon'
   }

   score = []
   let echo = ''

   ftime = x => x ? new Intl.DateTimeFormat("pt-PT",fmt).format(new Date(+x*1000)) : ""

   for (let m of $(data.members)) {

      let lastKey = x => Math.max(0,...Object.keys(x))
      let lastValue = x => x[lastKey(x)] || 0

      m.completed = {
         last: {
            day: lastKey(m.completion_day_level) || 0,
            part: lastKey(lastValue(m.completion_day_level)) || 0,
            time: m.last_star_ts
         },
         days: [],
         last_consec: {
            day: 0,
            part: 0,
            time: Date.now()
         }
      }

      let i = 0
      while (++i <= 25) {
         m.completed.days.push(Object.keys(m.completion_day_level[i] || {}).length)
      }

      let ii = 0
      while (m.completion_day_level[++ii]) m.completed.last_consec = { day: ii, part: lastKey(m.completion_day_level[ii]), time: lastValue(m.completion_day_level[ii]).get_star_ts }

   // console.log(m.completed)

      score.push(m)
   }

   console.log(score)

   // rank by last consecutive star time
   score.sort((a,b) => a.completed.last_consec.time - b.completed.last_consec.time)
   // rank by number of consecutive stars
   let consec = function (arr) {
      let r = 0
      for (x of arr) {
         if (x > 0) {
            r += x
         } else {
            break
         }
      }
      return r
   }
   score.sort((a,b) => consec(b.completed.days) - consec(a.completed.days))

   for (let m of score) {

      let map = {0:' ',1:'.',2:':'}
      let completed_stars = m.completed.days.map(x => map[x]).join('')

      if (m.stars) {
         echo += String(m.completed.last_consec.day).padStart(2,' ')
         echo += ' '
         echo += m.name || '#' + m.id
         echo += '\n'
         echo += ''.padEnd(m.completed.last_consec.part,'*').padStart(2,' ')
         echo += ' '
         echo += [...ftime(m.completed.last_consec.time)].filter(x => x != ',').join('').split(' ').reverse().join(' ')
         echo += '\n'
         echo += ''.padStart(2,' ')
         echo += ' '
         echo += completed_stars
         echo += '\n\n'
      }

   }

   ctx.replyWithHTML('<code>' + (echo || 'nada') + '</code>')

}

