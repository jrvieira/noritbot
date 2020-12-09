const bot = require('./core.js')
const fs = require('fs')


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

   console.info('oi?')
   let now = Date.now()

   if (now - oi_t > 60000 && ++ oi_n % 2) {

      oi_t = now
      return true

   }

}


// fns

bot.hears('fds', ctx => ctx.reply('fns'))
bot.hears(/\s*merda\s*/, ctx => ctx.replyWithHTML('é tudo uma <b>merda</b>'))
bot.hears(/\s*covid\s*/, ctx => ctx.reply('🇸🇪'))
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

const { exec } = require('child_process')

function aoc_leaderboard (ctx) {
   
   const addr = 'https://adventofcode.com/2020/leaderboard/private/view/983136.json'
   const sess = '53616c7465645f5fc4e12522d9980eeabf2be187fc95f706679b4348d021b749adc5e3b59142db293423708e7913505b'
   const comm = 'curl -s --cookie "session='+sess+'" '+addr
   
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
   
         print += '\n' + day
   
         for (let member of members) {
            records[day][member] = records[day][member] || ['','']
         }
   
         for (let member of members) {
            print += '   ' + (records[day][member][0] || '     ')
         }
   
         print += '\n'
         print += ' '
   
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
   
   const addr = 'https://adventofcode.com/2020/leaderboard/private/view/983136.json'
   const sess = '53616c7465645f5fc4e12522d9980eeabf2be187fc95f706679b4348d021b749adc5e3b59142db293423708e7913505b'
   const comm = 'curl -s --cookie "session='+sess+'" '+addr
   
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
            
            let p1 = $(member.completion_day_level[day])[0].get_star_ts
            let p2 = $(member.completion_day_level[day])[1].get_star_ts
            
            let d = p2 - p1
            let nhrs = Math.floor(d / 60 / 60)
            let dhrs = nhrs ? ('' + nhrs + ':').padStart(3,' ') : '   '
            let nmns = Math.floor(d / 60) - nhrs * 60
            let dmns = ('' + nmns + '\'').padStart(3,nhrs ? '0' : ' ')
            let dscs = ('' + (Math.floor(d - nhrs * 60 * 60 - nmns * 60))).padStart(2,'0')

            records[day][member.name] = dhrs + dmns + dscs

            console.log('delta',records[day][member.name])
            console.log(p2-p1)

         }
   
      }
   
      let print = '' 
   
      for (let day in records) {
   
         print += '\n' + day
   
         for (let member of members) {
            print += '  ' + (records[day][member] || '     ')
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

// launch

bot.launch()
