const bot = require('../core')
const util = require('../util')

let mem = bot.mem.load('quotes')

module.exports = async ctx => {

   let r

   try {

      let rand = await util.random(mem)
      r = rand.quote + '\n\n' + '- ' + rand.author

   } catch (e) {

      r = ':('
      console.error(e)

   } finally {

      ctx.reply(r)

   }

}


