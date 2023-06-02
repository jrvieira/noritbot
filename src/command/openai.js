const bot = require('../core')
const util = require('../util')
const { exec } = require('child_process')

let oai_key = bot.mem.load('env').oai_key

module.exports = {

   ai: async ctx => {

      let caller = await util.title(ctx)
      let query = ctx.message.text.split(' ').slice(1).join(' ')

      if (!query) return null

      let comm = `curl -s 'https://api.openai.com/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer ${oai_key}' \
-d '{ \
 "model": "gpt-3.5-turbo", \
 "messages": [{"role": "user", "content": "${encodeURI(query)}"}] \
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
         ctx.reply(caller + ': ' + r.choices[0].message.content)
      }

   },

}
