const { Telegraf } = require('telegraf')
const jlast = require('jlast')

const bot = module.exports = new Telegraf(process.argv[2]).start(ctx => ctx.reply('🔥'))

bot.mem = {
   load (db) {
      try {
         jlast.load('mem/' + db + '.json')
      } catch (e) {
         Telegraf.reply(db + '.json fns')
         Telegraf.reply(e)
      }
   },
   save (db,data) {
      jlast.save('mem/' + db + '.json',data)
   }
}
