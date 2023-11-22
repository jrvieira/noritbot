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

   bot.hears('vou almoçar', _ => !bot.stt.busy ? azia(+1) : null)
   bot.hears(/fds/,         _ => !bot.stt.busy ? azia(+1) : null)
   bot.hears(/foda/,        _ => !bot.stt.busy ? azia(+1) : null)
   bot.hears(/mal/,         _ => !bot.stt.busy ? azia(+1) : null)
   bot.hears(/\s+azia/,     _ => !bot.stt.busy ? azia(+1) : null)
   bot.hears(/crl/,         _ => !bot.stt.busy ? azia(+1) : null)
   bot.hears(/merda/,       _ => !bot.stt.busy ? azia(+1) : null)
   bot.hears(/covid/,       _ => !bot.stt.busy ? azia(+1) : null)

   bot.hears('calma',       _ => !bot.stt.busy ? azia(-1) : null)
   bot.hears(/(^|\s)ami/,   _ => !bot.stt.busy ? azia(-1) : null)
   bot.hears(/bom/,         _ => !bot.stt.busy ? azia(-1) : null)
   bot.hears(/boa/,         _ => !bot.stt.busy ? azia(-1) : null)
   bot.hears(/bonito/,      _ => !bot.stt.busy ? azia(-1) : null)
   bot.hears(/lindo/,       _ => !bot.stt.busy ? azia(-1) : null)
   bot.hears(/:\)/,         _ => !bot.stt.busy ? azia(-1) : null)
   bot.hears(/aha/,         _ => !bot.stt.busy ? azia(-1) : null)

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
// bot.hears(/aha/,           ctx => !bot.stt.busy && fns_cooldown() && util.maybe(bot.stt.azia/10) ? ctx.reply(Math.round(Math.random()*10)+'/10') : null)

   // adventofcode alarm

   function alarm () {
      const now = new Date()
      let aoc = new Date(now.getFullYear(), 11, 1, 5, 0, 0, 0)
      while (aoc < now && aoc.getDate() <= 25) {
         aoc.setMonth(11,aoc.getDate() + 1)
      }
      if (aoc.getDate() > 25) {
         aoc = new Date(aoc.getFullYear() + 1, 11, 1, 5, 0, 0, 0)
      }
      const til = aoc.getTime() - now.getTime()
      util.setReminder(() => {

         const url = 'https://adventofcode.com/' + now.getFullYear() + '/day/' + now.getDate()
         bot.telegram.sendMessage(bot.chn.prod, 'new aoc! ' + url);

         alarm()
      }, til)
   }

   alarm()

}
