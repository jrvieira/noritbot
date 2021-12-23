const bot = require('../core')
const util = require('../util')

let mem = bot.mem.load('etqlccm')

module.exports = async ctx => {

   let r
   let query = ctx.message.text.split(' ').slice(1)
   let caller = await util.title(ctx)
   let reply = ctx.message?.reply_to_message

   if (reply?.text) {

      try {

         let date = new Date(reply.date*1000)
         date = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear()

         if (!mem?.quotes) {
            mem = { quotes: [] }
         }

         mem.quotes.push({
            date: date,
            quote: reply.text,
            author: await util.title(ctx, reply.from.id),
            saved: caller,
            tags: query.map(x => x.replace(/^#*/,'')
         })

         bot.mem.save('etqlccm', mem)

      } catch (e) {

         r = ':('
         console.error(e)

      }

      ctx.reply(caller + ': ok')

   } else {

      try {

         let quotes = mem?.quotes || []

         if (query.length) {
            quotes = quotes.filter(x => x.tags.find(x => query.includes(x)))
         }

         if (quotes.length) {

            let rand = util.random(quotes)
            r = '<i>"' + rand.quote + '"\n- ' + rand.author + '</i>\n\n ' + rand.saved + ' tqlccm @ ' + rand.date + '\n\n'

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
