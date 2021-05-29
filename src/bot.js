const bot = require('./core.js')
const fs = require('fs')
const { exec, execFile } = require('child_process')



// debug

bot.command('debug', debug)

async function debug (ctx) {

   try {
   
      let data = await ctx.getChatAdministrators(ctx.message.chat.id)

      data = data.filter(u => !u.user.is_bot).map(u => u.custom_title)
      console.info('* debug', data)

   } catch (e) {
   
      console.error(e)

   } finally {
   
      console.info('* ctx.message', ctx.message)
   
   }
   
}


// oi?

bot.hears(/^[Oo]+i+[\s\?]*.*$/, ctx => oi() ? ctx.reply('oi?') : null)

let oi_t = 0
let oi_n = 0

function oi () { 

   let now = Date.now()
   console.info('oi?')

   if (now - oi_t > 60000 && ++ oi_n % 2) {

      oi_t = now
      return true

   }

}


// fns

bot.hears('fds', ctx => ctx.reply('fns'))
bot.hears(/\s*merda\s*/, ctx => ctx.replyWithHTML('é tudo uma <b>merda</b>'))
bot.hears(/\s*covid\s*/, ctx => ctx.reply('🇸🇪'))
bot.hears(/\s*norit\s*/, ctx => ctx.reply('ETDLCCM'))
bot.hears(/\s*ETQLCCM\s*/, ctx => ctx.reply('*ETDLCCM'))
bot.hears(/\s*:\)\s*/, ctx => ctx.reply('fns 5035514 msg'))


// pessoas

bot.command('pessoas', pessoas)

async function pessoas (ctx) {

   let r
   
   try {

      let admins = await ctx.getChatAdministrators(ctx.message.chat.id)    
      admins = admins.filter(u => !u.user.is_bot).map(u => u.custom_title)

      r = 'pessoas: \n'

      for (let admin of admins) {
   
         r += '\n' + admin

      }

   } catch (e) {
    
      r = ':('
      console.error(e)
      
   } finally {
   
      ctx.reply(r)

   }

}


// beer

bot.command('beer', ctx => ['/beer','/beer@noritbot'].includes(ctx.message.text) ? beerstat(ctx) : beer(ctx))

let mem_beer = bot.mem.load('beer')

async function beer (ctx) {

   let r
   
   try {

      let admins = await ctx.getChatAdministrators(ctx.message.chat.id)    
      admins = admins.filter(u => !u.user.is_bot).map(u => u.custom_title)
      let from = await ctx.getChatMember(ctx.message.from.id)
      from = from.custom_title

      let text = ctx.message.text.split(' ')
      let to = text[1].toLowerCase()
      let n = text[2] ? +text[2] : 1
      
      if (isNaN(n) || !admins.includes(to) || from === to || n < 0 || n > 20) {

         r = from + ' fns'

      } else {

         // init entry if inexistent
         mem_beer[to] = mem_beer[to] || {}
         mem_beer[to][from] = mem_beer[to][from] ? mem_beer[to][from] + n : n
         bot.mem.save('beer', mem_beer)

         r = from + ' -[' + n + ']-> ' + to + ' #beer'

      }

   } catch (e) {
    
      r = ':('
      console.error(e)
      
   } finally {
   
      ctx.reply(r)

   }

}

async function beerstat (ctx) {

   let r
   
   try {
   
      let admins = await ctx.getChatAdministrators(ctx.message.chat.id)    
      admins = admins.filter(u => !u.user.is_bot).map(u => u.custom_title)
      let from = await ctx.getChatMember(ctx.message.from.id)
      from = from.custom_title
      
      if (!from) throw new Error('no group admins here')

      let calc = {}

      for (let admin of admins) {
      
         let debt = (mem_beer?.[from]?.[admin] || 0) - (mem_beer?.[admin]?.[from] || 0)

         if (debt) calc[admin] = debt

      }

      if (Object.keys(calc).length) {
      
         r = from + ' beer:\n\n'

         for (let admin in calc) {
   
            r += admin + ' ' + calc[admin] + '\n'

         }

      } else {
   
         r = 'nada'

      }

   } catch (e) {
   
      r = ':('
      console.error(e)

   } finally {
   
      ctx.reply(r)

   }

}


// quote

bot.command('quote', quote)

let mem_quote = bot.mem.load('quotes')

async function quote (ctx) {
   
   let r

   try {
   
      let rand = await mem_quote[Math.random() * mem_quote.length >> 0]
      r = rand.quote + '\n\n' + '- ' + rand.author

   } catch (e) {
   
      r = ':('
      console.error(e)

   } finally {
   
      ctx.reply(r)

   }

}


// aoc_leaderboard

bot.command('aoc_leaderboard', ctx => aoc_cooldown() ? aoc_leaderboard(ctx) : ctx.reply('calma'))
bot.command('aoc_time', ctx => aoc_cooldown() ? aoc_time(ctx) : ctx.reply('calma'))

let aoc_t = 0

function aoc_cooldown () {

   let now = Date.now()

   if (now - aoc_t > 60000) {

      aoc_t = now
      return true

   }

}

const addr = 'https://adventofcode.com/2020/leaderboard/private/view/983136.json'
const sess = '53616c7465645f5fef5fe7775166b5b6449c0e7e8c959dd3cb6b9aa4a59df539601652d75bdedefb1640dc210951178d'
const comm = 'curl -s --cookie "session='+sess+'" '+addr

function aoc_leaderboard (ctx) {
   
   exec (comm, (error, stdout, stderr) => {
      if (error) {
          return ':('
      }
      if (stderr) {
          return ':('
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
   
}

function aoc_time (ctx) {
   
   exec (comm, (error, stdout, stderr) => {
      if (error) {
          return ':('
      }
      if (stderr) {
          return ':('
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


// countdown 2021

let countdown_target = 1621033200000

let countdown = 0

setInterval(cd,1000*60)

function cd () {


   let horas = Math.ceil((countdown_target  - Date.now()) / 1000 / 60 / 60)

   if (horas !== countdown && horas > -1) {

      countdown = horas

      bot.telegram.setChatTitle(-1001245137014,'Countdown: ' + horas + (horas === 1 ? ' hora ❤️' : ' horas ❤️'))
      
   }

}


// javascript eval

bot.command('js', ctx => ['/js','/js@noritbot'].includes(ctx.message.text) ? null : js(ctx))

async function js (ctx) {

   let expr = ctx.message.text.split(' ').slice(1).join(' ')

   let options = {
      cwd: '/home/safe',
   }

   execFile('/usr/local/bin/node',['-p',expr], options, (error, stdout, stderr) => {
      if (error) {
         return ':('
      }
      if (stderr) {
         return ':('
      }
      return run(stdout)
   })

   function run (r) {

      ctx.reply(r)
   
   }

}


// haskell eval

bot.command('hs', ctx => ['/hs','/hs@noritbot'].includes(ctx.message.text) ? null : hs(ctx))

async function hs (ctx) {

   let expr = ctx.message.text.split(' ').slice(1).join(' ')

   let options = {
      cwd: '/home/safe',
   }

   execFile('/usr/bin/ghc',['-ignore-dot-ghci','-e',expr], options, (error, stdout, stderr) => {
      if (error) {
         return ':('
      }
      if (stderr) {
         return ':('
      }
      return run(stdout)
   })

   function run (r) {

      ctx.reply(r)
   
   }

}


// python eval

bot.command('py', ctx => ['/py','/py@noritbot'].includes(ctx.message.text) ? null : py(ctx))

async function py (ctx) {

   let expr = ctx.message.text.split(' ').slice(1).join(' ')

   let options = {
      cwd: '/home/safe',
   }

   execFile('/usr/bin/python',['-c',expr], options, (error, stdout, stderr) => {
      if (error) {
         return ':('
      }
      if (stderr) {
         return ':('
      }
      return run(stdout)
   })

   function run (r) {

      ctx.reply(r)
   
   }

}


// wolfram alpha

bot.command('wa', ctx => ['/wa','/wa@noritbot'].includes(ctx.message.text) ? null : wa(ctx))

async function wa (ctx) {

   let query = ctx.message.text.split(' ').slice(1).join(' ')

   console.info('wa:', encodeURI(query))

   exec ('curl -X GET "http://api.wolframalpha.com/v2/result?appid=9AUKAU-L9KJ7YX5KV&input=' + encodeURI(query) + '"', (error, stdout, stderr) => {
      if (error) {
         console.error('error:', error)
         return ':('
      }
      if (stderr) {
         // for some reason curl suses stderrs io metrics
         // console.error('stderr:', stderr)
         // return ':('
      }
      return run(stdout)
   })

   function run (r) {

      ctx.reply(r)
   
   }

}


// corona stats

bot.command('corona', corona)

async function corona (ctx) {

   let expr = ctx.message.text.split(' ').slice(1).join(' ') || 'portugal'

   let options = {
      cwd: '/home/safe',
   }

   execFile('/usr/local/bin/corona',['-j',expr], options, (error, stdout, stderr) => {
      if (error) {
         console.error('error:',error)
         return ':('
      }
      // this package has terrible error handling
      // if (stderr) {
      //    console.info('stderr:',stderr)
      //    return ':(' 
      // }
      return run(stdout)
   })

   function run (s) {

      let j = JSON.parse(s)

      let r = `${j[1]['Country']}
<code>
total: ${j[1]['Cases'].toLocaleString('eu')} / ${j[0]['Cases'].toLocaleString('eu')}
p/Mil: ${j[1]['Per Million'].toLocaleString('eu')} / ${j[0]['Per Million'].toLocaleString('eu')}

ativos: ${j[1]['Active'].toLocaleString('eu')} / ${j[0]['Active'].toLocaleString('eu')}
graves: ${j[1]['Critical'].toLocaleString('eu')} / ${j[0]['Critical'].toLocaleString('eu')}
mortes: ${j[1]['Deaths (today)'].toLocaleString('eu')} / ${j[0]['Deaths (today)'].toLocaleString('eu')} 
</code>`

      ctx.replyWithHTML(r)
   
   }

}

// launch

bot.launch()
console.info('ok')

