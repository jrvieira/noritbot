const bot = require('../core')
const util = require('../util')

let mem = bot.mem.load('taow')

module.exports = async ctx => {

   // command arguments
   let query = ctx.message.text.split(' ').slice(1).map(x => Number(x) > 0 ? Number(x) - 1 : undefined)

   let r

   try {

      let chapters = Object.keys(mem)

      let chapter = chapters[query[0]] || util.random(chapters)
      let quote = mem[chapter][query[1]] || util.random(mem[chapter])

      r = chapter + '\n\n<i>' + quote + '</i>'

   } catch (e) {

      r = ':('
      console.error(e)

   } finally {

      ctx.replyWithHTML(r)

   }

}


