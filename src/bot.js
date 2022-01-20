const bot = require('./core')

bot.command('words'    , require('./command/words')          )
bot.command('remind'   , require('./command/remind')         )
bot.command('etqlccm'  , require('./command/etqlccm')        )
bot.command('etdlccm'  , require('./command/etqlccm')        )
bot.command('beer'     , require('./command/beer')           )
bot.command('quote'    , require('./command/quote')          )
bot.command('js'       , require('./command/eval').javascript)
bot.command('hs'       , require('./command/eval').haskell   )
bot.command('py'       , require('./command/eval').python    )
bot.command('wa'       , require('./command/wolframalpha').wa)
bot.command('wi'       , require('./command/wolframalpha').wi)
bot.command('aoc'      , require('./command/aoc')            )
bot.command('covid'    , require('./command/covid')          )
bot.command('horoscope', require('./command/zodiac')         )
bot.command('horoscopo', require('./command/zodiac')         )
bot.command('suntzu'   , require('./command/taow')           )
bot.command('taow'     , require('./command/taow')           )

require('./command/oi')() // basic stuff

// launch

bot.launch()

// graceful stop

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

// debug

bot.command('debug', async ctx => {

   try {
      let data = await ctx.getChatAdministrators(ctx.message.chat.id)
      data = data.filter(u => !u.user.is_bot).map(u => u.custom_title)
      console.info('* debug', data)
   } catch (e) {
      console.error(e)
   } finally {
      console.info('* ctx.message', ctx.message)
      //console.info('* reply', bot.telegram.sendMessage)
   }

})

console.info('ok')
