const bot = require('../core')
const util = require('../util')
const { exec } = require('child_process')

let oai_key = bot.mem.load('env').oai_key

let past = []

module.exports = {

   ai: async ctx => {

      let caller = await util.title(ctx)
      let query = ctx.message.text.split(' ').slice(1).join(' ')

      if (!query) return null

      past.push({role: "user", content: query})

      let comm = `curl -s 'https://api.openai.com/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer ${oai_key}' \
-d '{ \
 "model": "gpt-3.5-turbo", \
 "messages": ${JSON.stringify(past)} \
}' \
`

      exec (comm, (error, stdout, stderr) => {
         if (error) {
            console.error(error)
            return run(':(')
         }
         if (stderr) {
            console.error(stderr)
            return run(':(')
         }
         try {
            r = JSON.parse(stdout)
         } catch (err) {
            r = {}
         }
         return run(r)
      })

      function run (r) {
         let msg = r.choices[0].message.content
         past.push({role: "assistant", content: msg})
         ctx.reply(caller + ': ' + msg)
      }

   },

}
