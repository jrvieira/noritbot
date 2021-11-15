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
      //console.info('* title', await title(ctx))
      //console.info('* reply', bot.telegram.sendMessage)

   }

}


// util

async function title (ctx, id = ctx.message.from.id) {

   try {

      let data = await ctx.getChatAdministrators(ctx.message.chat.id)

      return data.filter(u => u.user.id == id)[0].custom_title

   } catch (e) {

      return ctx.message.from?.first_name || 'someone'

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

let beer_mem = bot.mem.load('beer')

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

      if (isNaN(n) || !admins.includes(to) || from === to || n < 0 || n > 10 || n !== Math.ceil(n) ) {

         r = from + ' fns'

      } else {

         // init entry if inexistent
         beer_mem[to] = beer_mem[to] || {}
         beer_mem[to][from] = beer_mem[to][from] ? beer_mem[to][from] + n : n
         bot.mem.save('beer', beer_mem)

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

         let debt = (beer_mem?.[from]?.[admin] || 0) - (beer_mem?.[admin]?.[from] || 0)

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

const aoc_addr = 'https://adventofcode.com/2020/leaderboard/private/view/983136.json'
const aoc_sess = '53616c7465645f5f9ad0532e17fb0aa29e9fd49e33bbebbcc268d7cfd20a94a706e9bcb152b6668468e375c2064a65ec'
const aoc_comm = 'curl -s --cookie "session='+aoc_sess+'" '+aoc_addr

function aoc_leaderboard (ctx) {

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

}

function aoc_time (ctx) {

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


// countdown

let countdown_target = 1638316800000
let countdown = 0

setInterval(cd,1000*60)

function cd () {

   let horas = Math.ceil((countdown_target  - Date.now()) / 1000 / 60 / 60)

   if (horas !== countdown && horas > -1) {

      countdown = horas

      if (horas < 48) {

         bot.telegram.setChatTitle(-1001245137014, horas + (horas === 1 ? ' hora 🤍' : ' horas 🤍'))

      } else if (horas % 24 === 0) {

         bot.telegram.setChatTitle(-1001245137014, (horas / 24) + ' dias 🤍')

      }

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
         console.error(error)
         return run(':(')
      }
      if (stderr) {
         console.error(stderr)
         return run(':(')
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
         console.error(error)
         return run(':(')
      }
      if (stderr) {
         console.error(stderr)
         return run(':(')
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
         console.error(error)
         return run(':(')
      }
      if (stderr) {
         console.error(stderr)
         return run(':(')
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

   let caller = await title(ctx)

   let query = ctx.message.text.split(' ').slice(1).join(' ')

   let comm = `curl -s -G 'https://api.wolframalpha.com/v1/result' \
-d appid=9AUKAU-L9KJ7YX5KV \
-d input=${encodeURI(query)} \
-d units=metric \
-d latlong=41.15,8.62 \
`

   exec (comm, (error, stdout, stderr) => {
      if (error) {
         console.error(error)
         return run(':(')
      }
      if (stderr) {
         console.error(stderr)
         return run(':(')
      }
      return run(stdout)
   })

   function run (r) {

      ctx.reply(caller + ': ' + r)

   }

}


// wolfram alpha simple (image/info)

bot.command('wi', ctx => ['/wi','/wi@noritbot'].includes(ctx.message.text) ? null : wi(ctx))

async function wi (ctx) {

   let query = ctx.message.text.split(' ').slice(1).join(' ')

   console.info('wi query:', query)

   ctx.replyWithHTML(await title(ctx) + ': <a href="https://api.wolframalpha.com/v1/simple?appid=9AUKAU-L9KJ7YX5KV&layout=labelbar&units=metric&i=' + query + '">' + query + '</a>')

}


// covid stats

bot.command('covid', covid)

async function covid (ctx) {

   let expr = ctx.message.text.split(' ').slice(1).join(' ') || 'portugal'

   let options = {
      cwd: '/home/safe',
   }

   execFile('/usr/local/bin/corona',['-j',expr], options, (error, stdout, stderr) => {
      if (error) {
         console.error(error)
         return run(':(')
      }
      // this package has terrible error handling
      // if (stderr) {
      //    console.error(stderr)
      //    return run(':(')
      // }
      return run(stdout)
   })

   function run (s) {

      let j = JSON.parse(s)

      let r = `${j[1]['Country']}
<code>
total: ${j[1]['Cases'].toLocaleString('eu')} / ${j[0]['Cases'].toLocaleString('eu')}
p/Mil: ${j[1]['Per Million'].toLocaleString('eu')} / ${j[0]['Per Million'].toLocaleString('eu')}

diario: ${j[1]['Cases (today)'].toLocaleString('eu')} / ${j[0]['Cases (today)'].toLocaleString('eu')}

ativos: ${j[1]['Active'].toLocaleString('eu')} / ${j[0]['Active'].toLocaleString('eu')}
graves: ${j[1]['Critical'].toLocaleString('eu')} / ${j[0]['Critical'].toLocaleString('eu')}
mortes: ${j[1]['Deaths (today)'].toLocaleString('eu')} / ${j[0]['Deaths (today)'].toLocaleString('eu')}
</code>`

      ctx.replyWithHTML(r)

   }

}


// remind

bot.command('remind', remind)

async function remind (ctx) {

   let caller = await title(ctx)

   let reminder = 0

   let expr = ctx.message.text.split(' ').slice(1)

   for (let e of expr) {

      let n = e.slice(0,-1)
      let t = e.slice(-1)

      if (!isNaN(+n)) {

         switch (t) {
            case 'd':
               reminder += n * 1000 * 60 * 60 * 24;
               break;
            case 'h':
               reminder += n * 1000 * 60 * 60;
               break;
            case 'm':
               reminder += n * 1000 * 60;
               break;
            default:
               reminder = 0;
         }

      } else {

         return run(':(')

      }

   }

   let origin = Date.now()

   function format (ts) {

      let date = new Date(ts)

      let [month, day, hour, minute] = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]

      let months = ['Jan','Feb','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

      return months[month] + ' ' + day + ' ' + (hour).toString().padStart(2,'0') + ':' + (minute).toString().padStart(2,'0')

   }

   // setReminder is a better setTimeout without 32bit signed int limitation
   function setReminder (f, t) {

      t = t < 0 ? 0 : t

      if (t >= 2**31) {
         setTimeout(() => setReminder(f, t - 2**31 + 1), 2**31 - 1)
      } else {
         setTimeout(f, t)
      }

   }

   if (reminder >= 1000 * 60) {

      setReminder(() => runReply(), reminder)

      let target = origin + reminder

      //run('reminding @ ' + format(target) + ' UTC')
      run('ok')

      console.info('reminding @', reminder, ctx.message.message_id)

   } else {

      return run(':(')

   }

   function run (r) {

      ctx.reply(caller + ': ' + r)

   }

   function runReply () {

      //ctx.telegram.sendMessage(ctx.message.chat.id, 'reminder from ' + format(origin), {reply_to_message_id: ctx.message.message_id, allow_sending_without_reply: false /* this is not working */})
      ctx.telegram.sendMessage(ctx.message.chat.id, 'reminder from ' + caller, {reply_to_message_id: ctx.message.message_id, allow_sending_without_reply: false /* this is not working */})

   }

}


// zodiac

bot.command('horoscope', horoscope)
bot.command('horoscopo', horoscope)

async function horoscope (ctx) {

   let query = ctx.message.text.split(' ').slice(1).join(' ')

   zodiac = new Map([
      ['aquarius','aquarius'],
      ['aquario','aquarius'],
      ['pisces','pisces'],
      ['peixe','pisces'],
      ['peixes','pisces'],
      ['aries','aries'],
      ['carneiro','aries'],
      ['taurus','taurus'],
      ['touro','taurus'],
      ['gemini','gemini'],
      ['gemeos','gemini'],
      ['cancer','cancer'],
      ['caranguejo','cancer'],
      ['leo','leo'],
      ['leao','leo'],
      ['virgo','virgo'],
      ['virgem','virgo'],
      ['libra','libra'],
      ['balanca','libra'],
      ['scorpio','scorpio'],
      ['escorpiao','scorpio'],
      ['sagittarius','sagittarius'],
      ['sagitario','sagittarius'],
      ['capricorn','capricorn'],
      ['capricornio','capricorn'],
      ['capricornus','capricorn'],
   ])

   let comm = 'curl -s -L https://ohmanda.com/api/horoscope/' + zodiac.get( query.normalize('NFD').replace(/\p{Diacritic}/gu, "") )

   console.info(comm)

   let r

   let caller = await title(ctx)

   exec (comm, (error, stdout, stderr) => {
      if (error) {
         console.error(error)
         return run(':(')
      }
      if (stderr) {
         console.error(stderr)
         return run(':(')
      }
      return run(JSON.parse(stdout).horoscope)
   })

   function run (r) {

      ctx.reply(caller + ': ' + r)

   }

}


// etqlccm

bot.command('etqlccm', etqlccm)
bot.command('etdlccm', etqlccm)

let mem_etqlccm = bot.mem.load('etqlccm')

async function etqlccm (ctx) {

   let r

   let query = ctx.message.text.split(' ').slice(1)

   let caller = await title(ctx)

   let reply = ctx.message?.reply_to_message

   if (reply?.text) {

      try {

         let date = new Date(reply.date*1000)
         date = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear()

         if (!mem_etqlccm?.quotes) {

            mem_etqlccm = { quotes: [] }

         }

         mem_etqlccm.quotes.push({
            date: date,
            quote: reply.text,
            author: await title(ctx, reply.from.id),
            saved: caller,
            tags: query
         })

         let save = bot.mem.save('etqlccm',
            mem_etqlccm
         )

         bot.mem.save(save)

      } catch (e) {

         r = ':('
         console.error(e)

      }

      ctx.reply(caller + ': ok')

   } else {

      try {

         let quotes = mem_etqlccm?.quotes || []

         if (query.length) {

            quotes = quotes.filter(x => x.tags.find(x => query.includes(x)))

         }

         if (quotes.length) {

            let rand = quotes[Math.random() * quotes.length >> 0]
            r = '<i>"' + rand.quote + '" - ' + rand.author + '</i>\n\n ' + rand.saved + ' tqlccm @ ' + rand.date + '\n\n'

            rand.tags.forEach(function (t) {

               r += '#' + t + ' '

            })

         } else {

            r = ':('

         }


      } catch (e) {

         r = ':('
         console.error(e)

      } finally {

         ctx.replyWithHTML(r)

      }

   }

}


// fns

let fns_t = 0

function fns_cooldown () {

   let now = Date.now()

   if (now - fns_t > 60000*6) {

      fns_t = now
      return true

   }

}

function maybe (n) {

   return n > Math.random()

}

bot.hears('fds', ctx => fns_cooldown() && maybe(.1) ? ctx.reply('fns') : null)
bot.hears(/\s+merda\s*/, ctx => fns_cooldown() && maybe(.1) ? ctx.replyWithHTML('é tudo uma <b>merda</b>') : null)
bot.hears(/\s+covid\s*/, ctx => fns_cooldown() && maybe(.1) ? ctx.reply('🇸🇪') : null)
bot.hears(/\s+@*norit\s*/, ctx => fns_cooldown() && maybe(.1) ? ctx.reply('ETDLCCM') : null)
bot.hears(/\s*ETQLCCM\s*/, ctx => fns_cooldown() && maybe(.1) ? ctx.reply('*ETDLCCM') : null)
bot.hears(/\s*:\)\s*/, ctx => fns_cooldown() && maybe(.1) ? ctx.reply('👆👉') : null)


// launch

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.info('ok')

