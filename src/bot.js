const bot = require('./core.js')

const admins = [
   'ze',
   'matos',
   'marques',
   'ruivalente',
   'pacholas',
   'kill',
   'sanches',
   'rafa',
   'xico',
   'bifes',
   'sergio',
   'tomas',
   'neves',
]


// debug

bot.command('debug', ctx => console.info(ctx.updateType, ctx.message))


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


// beer

bot.command('beer', beer)

let mem_beer = bot.mem.load('beer')

function beer (ctx) {
   
   let from = ctx.message.from.first_name

   let text = ctx.message.text.split(' ')
   let to = text[1]
   let n = +text[2]
   
   if (isNaN(n) || !admins.includes(to)) {

      ctx.reply('@' + from + ' fns')

   } else {

      // init entry if inexistent
      mem_beer[to] = mem_beer[to] || {}
      mem_beer[to][from] = mem_beer[to][from] ? mem_beer[to][from] + n : n
      bot.mem.save('beer', mem_beer)
      ctx.reply('@' + from + ' ok!')

   }

}


// launch

bot.launch()
