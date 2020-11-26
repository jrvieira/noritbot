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
      
      if (isNaN(n) || !admins.includes(to) || from === to) {

         r = from + ' fns'

      } else {

         // init entry if inexistent
         mem_beer[to] = mem_beer[to] || {}
         mem_beer[to][from] = mem_beer[to][from] ? mem_beer[to][from] + n : n
         bot.mem.save('beer', mem_beer)
         r = from + ' ok!'

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


// launch

bot.launch()
