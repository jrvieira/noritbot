const bot = require('../core')
const util = require('../util')
const fs = require('fs')

// load dictionary into memory

let dict

fs.readFile('mem/words.txt', 'utf8', function (err, data) {
   if (err) throw new Error(err)
   dict = new Set(data.split('\n'))
})

// initialize global variables

let wildcard = '_'
let alphabet = []
let i = 90
while (i >= 65) alphabet.push(i--)
alphabet = alphabet
   .map(x => String.fromCharCode(x))
   .filter(x => !['K','W','Y'].includes(x))
alphabet.push(wildcard)
let vowels = ['A','E','I','O','U']

let w = '' // letters
let wmap = {}
let wn = 16 // number of letters
let min = 6 // minimum word length
let scores = {} // scored words
let mem = bot.mem.load('words') // hi scores
let called = { time: 0, caller: null, duration: null } // last call
let gap = 16 // time buffer

module.exports = async ctx => {

   // deactivate /words on main channel
   if (ctx.message.chat.id == bot.chn.prod) {
      bot.telegram.deleteMessage(ctx.message.chat.id,ctx.message.message_id)
      let caller = await util.title(ctx)
      let reply = await ctx.reply(caller + ': /words desativado neste canal')
      setTimeout(() => bot.telegram.deleteMessage(ctx.message.chat.id,reply.message_id), 6000)
      return null
   }

   // command arguments
   let query = ctx.message.text.split(' ').slice(1).join(' ')

   if (query === 'top') { // hi scores

      let scoreboard = ''

      let padding = pad(mem)
      for (let score of Object.entries(mem).sort((a,b) => a[1] > b[1] ? -1 : 1)) {
         scoreboard += score[1]
            .toString()
            .padStart(padding,' ')
            + ' ' + score[0] + '\n'
      }

      ctx.replyWithHTML('<b>HI SCORES!</b>\n\n'
         + '<code>' + scoreboard + '</code>'
      )

   } else if (bot.stt.busy) { // bot i busy (ex: game is being played)

      //ctx.replyWithHTML('<code>' + [...w].join(' ') + '</code>')
      bot.telegram.deleteMessage(ctx.message.chat.id,ctx.message.message_id)

   } else if (!query
      || +query === Math.round(query)
      && query >= gap
      && query <= 120
   ) {

      // call

      let caller = await util.title(ctx)

      let call = (d) => {
         called = {
            time: Date.now(),
            caller: caller,
            duration: d || (query ? query * 1000 : 60 * 1000)
         }
      }

      if (caller === called.caller || Date.now() - called.time > gap * 1000) {
         call()
         console.info(caller + ' challanged /words...')
         return null
      }
      console.info(caller + ' accepted!')

      // initialize the game

      bot.stt.busy = true

      // if within gap, call the game with challenger's duration

      call(called.duration)

      // delete second call command

      bot.telegram.deleteMessage(ctx.message.chat.id,ctx.message.message_id)

      // reset global variables

      scores = {}
      w = ''
      wmap = {}

      // create puzzle

      while (w.length < wn) {
         let letter = util.random(util.maybe(1/6) ? vowels : alphabet)
         wmap[letter] = ++ wmap[letter] || 1
         w += letter
      }

      // start the game

      let pin = await bot.telegram.sendMessage(
         ctx.message.chat.id,
         '<b>WORDS!</b> ' + called.duration / 1000 + 's\n\n'
            + '<code>' + [...w].join(' ') + '</code>',
         { parse_mode: 'HTML' }
      )

      bot.telegram.pinChatMessage(
         ctx.message.chat.id,
         pin.message_id,
         { disable_notification: true }
      )

      console.info('WORDS! waiting for answers on', w)

      bot.on('message', async ctx => {

         if (w) {
            setTimeout(() => bot.telegram.deleteMessage(ctx.message.chat.id,ctx.message.message_id), 1000)
         }

         let p = (ctx.message?.text || '').toUpperCase()
         let caller = await util.title(ctx)

         if (Date.now() - called.time < called.duration && valid(p, caller)) {
            console.info(p, 'valid')
            if (!scores[caller]) scores[caller] = []
            scores[caller].push(p)
            ctx.replyWithHTML(caller + ' <b>' + val(p) + '!</b>')
         }

      })

      // end the game

      setTimeout(() => {

         if (Object.values(scores).length) {

            for (let player in scores) {
               let pts = vals(scores[player])
               let hi = mem[player] || 0
               if (pts > hi) {
                  mem[player] = pts
                  ctx.reply(player + ' ⭐️ hi score!')
               }
            }

            bot.mem.save('words', mem)

            let scoreboard = ''
            let scores_vals = {}

            for (let player in scores) {
               scores_vals[player] = vals(scores[player])
            }

            let padding = pad(scores_vals)
            for (let score of Object.entries(scores_vals).sort((a,b) => a[1] > b[1] ? -1 : 1)) {
               scoreboard += score[1]
                  .toString()
                  .padStart(padding,' ')
                  + ' ' + score[0] + '\n'
            }

            scoreboard += '\n🔥'

            for (let score of Object.entries(scores).sort((a,b) => a[1] > b[1] ? -1 : 1)) {
               scoreboard += '\n\n' + score[0] + ':'
               for (let word of score[1].sort((a,b) => val(a) > val(b) ? -1 : 1)) {
                  scoreboard += ' ' + word
               }

            }

            ctx.replyWithHTML('<b>ACABOU!</b>\n\n'
               + '<code>' + scoreboard + '</code>')

         } else {
            ctx.replyWithHTML('<b>ACABOU!</b>')
         }

         // reset

         bot.stt.busy = false

         w = ''
         wmap = {}

         bot.telegram.unpinChatMessage(
            ctx.message.chat.id,
            { message_id: pin.message_id }
         )

      }, called.duration)

   }

}

// point system

let val = p => 2 ** (p.length - min) // word value
let vals = arr => arr.map(x => val(x)).reduce((a,b) => a + b, 0) // total

// word validation

let valid = (p, caller) => {

   // let done = scores?.[caller] || [] // own
   let done = Object.values(scores).reduce((a,b) => a.concat(b), []) // all

   if (p.length < min
      || done.includes(p) // done
      || done.includes(p + 'S') // singular
      || (p.slice(-1) === 'S' && done.some(x => p === x + 'S')) // plural
   // || (p.slice(-1) === 'O' && done.some(x => p.slice(0,-1) + 'A' === x)) // masculine
   // || (p.slice(-1) === 'A' && done.some(x => p.slice(0,-1) + 'O' === x)) // feminine
   // || done.some(x => p.slice(0,min - 1) === x.slice(0,min - 1)) // same root ~
      || !dict.has(p)
   ) return false

   let m = Object.assign({},wmap)
   let pp = [...p]
   while (x = pp.pop()) {
      if (m[x]) {
         m[x] --
      } else if (m[wildcard]) {
         m[wildcard] --
      } else {
         return false
      }
   }

   return true

}

// padding

let pad = o => {
   return Object.values(o)
      .reduce((a,b) => a.toString().length > b.toString().length ? a : b, 0)
      .toString()
      .length
}
