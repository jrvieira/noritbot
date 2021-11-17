const bot = require('../core')
const util = require('../util')

module.exports = () => {

   // oi

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

   bot.command('pessoas', async ctx => {

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

   })

   // azia artificial

   let fns_t = 0

   function fns_cooldown () {
      let now = Date.now()
      if (now - fns_t > 60000*6) {
         fns_t = now
         return true
      }
   }

   bot.hears('fds', ctx => fns_cooldown() && util.maybe(.1) ? ctx.reply('fns') : null)
   bot.hears(/\s+merda\s*/, ctx => fns_cooldown() && util.maybe(.1) ? ctx.replyWithHTML('é tudo uma <b>merda</b>') : null)
   bot.hears(/\s+covid\s*/, ctx => fns_cooldown() && util.maybe(.1) ? ctx.reply('🇸🇪') : null)
   bot.hears(/\s+@*norit\s*/, ctx => fns_cooldown() && util.maybe(.1) ? ctx.reply('ETDLCCM') : null)
   bot.hears(/\s*ETQLCCM\s*/, ctx => fns_cooldown() && util.maybe(.1) ? ctx.reply('*ETDLCCM') : null)
   bot.hears(/\s*:\)\s*/, ctx => fns_cooldown() && util.maybe(.1) ? ctx.reply('👆👉') : null)

   // countdown

   let countdown_target = 1638316800000
   let countdown = 0

   setInterval(() => {

      let horas = Math.ceil((countdown_target  - Date.now()) / 1000 / 60 / 60)
      if (horas !== countdown && horas > -1) {
         countdown = horas
         if (horas < 48) {
            bot.telegram.setChatTitle(-1001245137014, horas + (horas === 1 ? ' hora 🤍' : ' horas 🤍'))
         } else if (horas % 24 === 0) {
            bot.telegram.setChatTitle(-1001245137014, (horas / 24) + ' dias 🤍')
         }
      }

   }, 1000*60)

   console.info('oi')

}
