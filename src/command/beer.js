const bot = require('../core')

let mem = bot.mem.load('beer')

module.exports = async ctx => {

   // command arguments
   let query = ctx.message.text.split(' ').slice(1).join(' ')

   let admins = await ctx.getChatAdministrators(ctx.message.chat.id)
   admins = admins.filter(u => !u.user.is_bot).map(u => u.custom_title)
   let from = await ctx.getChatMember(ctx.message.from.id)
   from = from.custom_title

   if (query) {

      let r
      try {

         let q = query.split(' ')
         let to = q[0].toLowerCase()
         let n = q[1] ? +q[1] : 1

         if (isNaN(n)
            || !admins.includes(to)
            || from === to
            || n < 0
            || n > 10
            || n !== Math.ceil(n)
         ) {
            r = from + ' fns'
         } else {
            // init entry if inexistent
            mem[to] = mem[to] || {}
            mem[to][from] = mem[to][from] ? mem[to][from] + n : n
            bot.mem.save('beer', mem)
            r = from + ' -[' + n + ']-> ' + to + ' #beer'
         }

      } catch (e) {
         r = ':('
         console.error(e)
      } finally {
         ctx.reply(r)
      }

   } else {

      let r
      try {

         if (!from) throw new Error('no group admins here')
         let calc = {}

         for (let admin of admins) {
            let debt = (mem?.[from]?.[admin] || 0) - (mem?.[admin]?.[from] || 0)
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

}
