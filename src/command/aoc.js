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

   for (let member of $(data.members)) {
      score.push(member)
   }
   // rank by last star time
   score.sort((a,b) => a.last_star_ts - b.last_star_ts)
   // rank by number of stars
   score.sort((a,b) => b.stars - a.stars)

   for (m of score) {

      let completed = {
         day: Math.ceil(m.stars/2),
         part: m.stars % 2 + 1,
         time: new Intl.DateTimeFormat("pt-PT",fmt).format(new Date(+m.last_star_ts*1000))
      }

      if (completed.day) {
         echo += String(completed.day).padStart(2,' ')
         echo += ' '
         echo += m.name
         echo += '\n'
         echo += completed.day == 25 ? '!!' : ''.padEnd(completed.part,'*').padStart(2,' ')
         echo += ' '
         echo += [...completed.time].filter(x => x != ',').join('').split(' ').reverse().join(' ')
         echo += '\n\n'
      }

   }

   ctx.replyWithHTML('<code>' + (echo || 'nada') + '</code>')

}

