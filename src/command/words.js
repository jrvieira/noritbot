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

let alphabet = []
let i = 90
while (i >= 65) alphabet.push(i--)
alphabet = alphabet
   .map(x => String.fromCharCode(x))
   .filter(x => !['K','W','Y'].includes(x))
let vowels = ['A','E','I','O','U']

let w = '' // letters
let t // time start
let scores // game score
let done = [] // scored words
let words_mem = bot.mem.load('words') // hi scores

module.exports = async ctx => {

   // command arguments
   let query = ctx.message.text.split(' ').slice(1).join(' ')

   if (query === 'top') { // hi scores

      let scoreboard = ''
      // right alignment
      let score_pad = Object.values(words_mem)
         .reduce((a,b) => a.toString().length > b.toString().length ? a : b, 0)
         .toString()
         .length

      for (let score of Object.entries(words_mem).sort((a,b) => a[1] > b[1] ? -1 : 1)) {
         scoreboard += score[1]
            .toString()
            .padStart(score_pad,' ') + ' ' + score[0] + '\n'
      }

      ctx.replyWithHTML('<b>HI SCORES!</b>\n\n'
         + '<code>' + scoreboard + '</code>'
      )

   } else if (w) { // game is currently being played

      ctx.replyWithHTML('<code>' + [...w].join(' ') + '</code>')

   } else if (!query || !isNaN(query)) { // let's roll

      // reset global variables

      scores = new Map()
      done = []

      // set local variables

      let duration = 60 * 1000 // default
      duration = query ? query * 1000 : duration
      t = Date.now()
      w = ''

      // create puzzle

      while (w.length < 16) {
         w += util.random(w.length % 6 ? alphabet : vowels)
      }

      // start the game

      let pin = await bot.telegram.sendMessage(
         ctx.message.chat.id,
         '<b>WORDS!</b> ' + duration / 1000 + 's\n\n'
            + '<code>' + [...w].join(' ') + '</code>',
         { parse_mode: 'HTML' }
      )

      bot.telegram.pinChatMessage(
         ctx.message.chat.id,
         pin.message_id,
         { disable_notification: true }
      )

      console.info('waiting for answers on', w)

      bot.on('message', async ctx => {

         let p = (ctx.message?.text || '').toUpperCase()

         if (w) {
            bot.telegram.deleteMessage(ctx.message.chat.id,ctx.message.message_id)
         }

         if ((Date.now() - t) < duration && valid(p)) {
            done.push(p)
            console.info(p, 'valid')
            let caller = await util.title(ctx)
            if (!scores.has(caller)) scores.set(caller,0)
            scores.set(caller, scores.get(caller) + val(p))
            ctx.replyWithHTML('<b>' + p + '!</b> ' + caller + ' ' + scores.get(caller))
         }

      })

      // end the game

      setTimeout(() => {

         if (done.length) {

            for (let score of scores) {
               let s = score[1]
               let h = words_mem[score[0]] || 0
               if (s > h) {
                  words_mem[score[0]] = s
                  ctx.reply(score[0] + ': hi score!')
               }
            }

            bot.mem.save('words', words_mem)
            let scoreboard = ''
            let score_pad = Object.values(scores).reduce((a,b) => a.toString().length > b.toString().length ? a : b, 0).toString().length
            for (let score of [...scores].sort((a,b) => a[1] > b[1] ? -1 : 1)) {
               scoreboard += score[1].toString().padStart(score_pad,' ')
                  + ' ' + score[0] + '\n'
            }
            ctx.replyWithHTML('<b>ACABOU!</b>\n\n'
               + '<code>' + scoreboard + '</code>')

         } else {
            ctx.replyWithHTML('<b>ACABOU!</b>')
         }

         // reset

         w = ''

         bot.telegram.unpinChatMessage(
            ctx.message.chat.id,
            { message_id: pin.message_id }
         )

      }, duration)

   }

}

// point system

let val = p => 2 ** (p.length - 5) // point system

// word validation

let valid = p => {

   if (p.length < 5
      || done.includes(p)
      || done.includes(p + 'S')
      || (p.substr(-1) === 'S' && done.some(x => p === x + 'S'))
      || !dict.has(p)
   ) return false

   let m = new Map()
   let ww = [...w]

   while (x = ww.pop()) {
      m.set(x,m.has(x) ? m.get(x) + 1 : 1)
   }

   let pp = [...p]

   while (x = pp.pop()) {
      if (!m.get(x)) return false
      m.set(x,m.get(x) - 1)
   }

   return true

}

