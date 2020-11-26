const bot = require('./core.js')

// oi?

bot.hears(/^[Ooi]+\?*.*{3,}$/, ctx => oi() ? ctx.reply('oi?') : null)

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

// beer

bot.command('/beer', beer)

function beer (ctx) {
   let from = ctx.message.from.id
   let to = '?'
   let n = 1
   let dprocess.argv[2]b = bot.mem.load('beer')
   // add user if inexistent
   db[to] = db[to] || {}
   // add giver if inexistent
   db[to][from] = db[to][from] ? db[to][from] + n : n
   bot.mem.save('beer',db)
}

// mentions

bot.mention(ctx => console.log(ctx))

// launch

bot.launch()
