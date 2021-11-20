const bot = require('../core')
const util = require('../util')

module.exports = () => {

   // oi

   bot.hears(/^[Oo]+i+[\s\?]*.*$/, ctx => !bot.stt.busy && oi() ? ctx.reply('oi?') : null)

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

      if (bot.stt.busy) return null

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

   let azia = a => {
      let t = bot.stt.azia + a
      bot.stt.azia = t > 10 ? 10 : t < 0 ? 0 : Math.round(t)
      console.info('azia =', bot.stt.azia)
   }

   bot.command('azia', ctx => ctx.reply('azia: ' + bot.stt.azia))

   bot.hears('vou almoçar', _ => azia(+1))
   bot.hears(/fds/,         _ => azia(+1))
   bot.hears(/foda/,        _ => azia(+1))
   bot.hears(/mal/,         _ => azia(+1))
   bot.hears(/\s+azia/,     _ => azia(+1))
   bot.hears(/crl/,         _ => azia(+1))
   bot.hears(/merda/,       _ => azia(+1))
   bot.hears(/covid/,       _ => azia(+1))

   bot.hears('calma',       _ => azia(-1))
   bot.hears(/(^|\s)ami/,   _ => azia(-1))
   bot.hears(/bom/,         _ => azia(-1))
   bot.hears(/boa/,         _ => azia(-1))
   bot.hears(/bonito/,      _ => azia(-1))
   bot.hears(/lindo/,       _ => azia(-1))
   bot.hears(/:\)/,          _ => azia(-1))

   let fns_t = 0

   function fns_cooldown () {
      let now = Date.now()
      if (now - fns_t > 60000*6) {
         fns_t = now
         return true
      }
   }

   bot.hears('fds',           ctx => !bot.stt.busy && fns_cooldown() && util.maybe(bot.stt.azia/10) ? ctx.reply('fns') : null)
   bot.hears(/\s+merda\s*/,   ctx => !bot.stt.busy && fns_cooldown() && util.maybe(bot.stt.azia/10) ? ctx.replyWithHTML('é tudo uma <b>merda</b>') : null)
   bot.hears(/\s+covid\s*/,   ctx => !bot.stt.busy && fns_cooldown() && util.maybe(bot.stt.azia/10) ? ctx.reply('🇸🇪') : null)
   bot.hears(/\s+@*norit\s*/, ctx => !bot.stt.busy && fns_cooldown() && util.maybe(bot.stt.azia/10) ? ctx.reply('ETDLCCM') : null)
   bot.hears(/\s*ETQLCCM\s*/, ctx => !bot.stt.busy                   && util.maybe(bot.stt.azia/10) ? ctx.reply('*ETDLCCM') : null)
   bot.hears(/\s*:\)\s*/,     ctx => !bot.stt.busy && fns_cooldown() && util.maybe(bot.stt.azia/10) ? ctx.reply('👆👉') : null)
   bot.hears(/aha/,           ctx => !bot.stt.busy && fns_cooldown() && util.maybe(bot.stt.azia/10) ? ctx.reply(Math.round(Math.random()*10)+'/10') : null)

   // countdown

   let countdown_target = 1638316800000
   let countdown = 0

   setInterval(() => {

      try {

         let horas = Math.ceil((countdown_target  - Date.now()) / 1000 / 60 / 60)
         if (horas !== countdown && horas > -1) {
            countdown = horas
            if (horas < 48) {
               bot.telegram.setChatTitle(bot.chn.prod, horas + (horas === 1 ? ' hora 🤍' : ' horas 🤍'))
            } else if (horas % 24 === 0) {
               bot.telegram.setChatTitle(bot.chn.prod, (horas / 24) + ' dias 🤍')
            }
         }

      } catch (err) {

         return null

      }

   }, 1000*60)

   console.info('oi')

}
