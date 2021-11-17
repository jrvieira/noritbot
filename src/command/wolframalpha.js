const bot = require('../core')
const util = require('../util')
const { exec } = require('child_process')

module.exports = {

   wa: async ctx => {

      let caller = await util.title(ctx)
      let query = ctx.message.text.split(' ').slice(1).join(' ')

      if (!query) return null

      let comm = `curl -s -G 'https://api.wolframalpha.com/v1/result' \
-d appid=9AUKAU-L9KJ7YX5KV \
-d input=${encodeURI(query)} \
-d units=metric \
-d latlong=41.15,8.62 \
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
         return run(stdout)
      })

      function run (r) {
         ctx.reply(caller + ': ' + r)
      }

   },

   // wolfram alpha simple (image/info)
   wi: async ctx => {

      let query = ctx.message.text.split(' ').slice(1).join(' ')
      if (!query) return null
      console.info('wi query:', query)
      ctx.replyWithHTML(await util.title(ctx) + ': <a href="https://api.wolframalpha.com/v1/simple?appid=9AUKAU-L9KJ7YX5KV&layout=labelbar&units=metric&i=' + query + '">' + query + '</a>')

   }

}
