const { exec } = require('child_process')

let aoc_t = 0

let aoc_cooldown = () => {
   let now = Date.now()
   if (now - aoc_t > 60000) {
      aoc_t = now
      return true
   }
}

const aoc_addr = 'https://adventofcode.com/2020/leaderboard/private/view/983136.json'
const aoc_sess = '53616c7465645f5f9ad0532e17fb0aa29e9fd49e33bbebbcc268d7cfd20a94a706e9bcb152b6668468e375c2064a65ec'
const aoc_comm = 'curl -s --cookie "session='+aoc_sess+'" '+aoc_addr

module.exports = {

   leaderboard: ctx => {

      if (!aoc_cooldown()) {
         ctx.reply('calma')
         return false
      }

      exec (aoc_comm, (error, stdout, stderr) => {
         if (error) {
            console.error(error)
            return run(':(')
         }
         if (stderr) {
            console.error(stderr)
            return run(':(')
         }
         return run(JSON.parse(stdout))
      })

      function run (data) {
         let $ = Object.values
         let fmt = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
            timeZone: 'Europe/Lisbon'
         }
         let members = []
         let records = {}
         for (let member of $(data.members)) {
            members.push(member.name)
            for (let day in member.completion_day_level) {
               records[day] = records[day] || {}
               records[day][member.name] = $(member.completion_day_level[day]).map(x =>
                  new Intl.DateTimeFormat("pt-PT",fmt).format(new Date(+x.get_star_ts*1000))
               )
            }
         }

         let print = ''

         for (let day in records) {

            print += '\n' + day.padStart(2,' ')

            for (let member of members) {
               records[day][member] = records[day][member] || ['','']
            }

            for (let member of members) {
               print += '   ' + (records[day][member][0] || '     ')
            }

            print += '\n'
            print += '  '

            for (let member of members) {
               print += '   ' + (records[day][member][1] || '     ')
            }

            print += '\n'

         }

         print += '\n'
         print += ' '

         for (let member of members) {
            print += '     ' + member.substring(0,3) + ''
         }

         ctx.replyWithHTML('<code>' + print + '\n' + '</code>')

      }

   },

   times: ctx => {

      if (aoc_cooldown()) {
         ctx.reply('calma')
         return false
      }

      exec (aoc_comm, (error, stdout, stderr) => {
         if (error) {
            console.error(error)
            return run(':(')
         }
         if (stderr) {
            console.error(stderr)
            return run(':(')
         }
         return run(JSON.parse(stdout))
      })

      function run (data) {

         let $ = Object.values
         let fmt = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            milisecond:'numeric',
            hour12: false,
            timeZone: 'Europe/Lisbon'
         }
         let members = []
         let records = {}

         for (let member of $(data.members)) {

            members.push(member.name)

            for (let day in member.completion_day_level) {
               records[day] = records[day] || {}
               let p1 = $(member.completion_day_level[day])[0] || null
               let p2 = $(member.completion_day_level[day])[1] || null
               if (p1 && p2) {
                  let d = p2.get_star_ts - p1.get_star_ts
                  let nhrs = Math.floor(d / 60 / 60)
                  let dhrs = nhrs ? ('' + nhrs + ':').padStart(3,' ') : '   '
                  let nmns = Math.floor(d / 60) - nhrs * 60
                  let dmns = ('' + nmns + '\'').padStart(3,nhrs ? '0' : ' ')
                  let dscs = ('' + (Math.floor(d - nhrs * 60 * 60 - nmns * 60))).padStart(2,'0')
                  records[day][member.name] = dhrs + dmns + dscs
               }
            }

         }

         let print = ''

         for (let day in records) {

            print += '\n' + day.padStart(2,' ')

            for (let member of members) {
               print += '  ' + (records[day][member] || '        ')
            }

            print += '\n'
            print += ' '

         }

         print += '\n'
         print += ' '

         for (let member of members) {
            print += '       ' + member.substring(0,3) + ''
         }

         ctx.replyWithHTML('<code>' + print + '\n' + '</code>')

      }

   }

}

