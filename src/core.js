const { Telegraf } = require('telegraf')
const jlast = require('jlast')

const bot = module.exports = new Telegraf(process.argv[2])

// JSON memory data management

bot.mem = {

   load (db) {
      let r
      try {
         r = jlast.load('../mem/' + db + '.json')
      } catch (e) {
         console.error('fns load: ' + e)
         Telegraf.reply(db + '.json fns')
         Telegraf.reply(e)
      } finally {
         return r
      }
   },

   save (db, data) {
      try {
         jlast.save('mem/' + db + '.json', data)
      } catch (e) {
         console.error('fns save: ' + e)
      } finally {
         console.info(db + ' updated')
      }
   }

}

