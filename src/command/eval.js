const bot = require('../core')
const { execFile } = require('child_process')

module.exports = {

   javascript: async ctx => {

      let expr = ctx.message.text.split(' ').slice(1).join(' ')

      if (!expr) return null

      let options = {
         cwd: '/home/safe',
      }

      execFile('/usr/local/bin/node',['-p',expr], options, (error, stdout, stderr) => {
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

         ctx.replyWithHTML('<code>'+r+'</code>')

      }

   },

   haskell: async ctx => {

      let expr = ctx.message.text.split(' ').slice(1).join(' ')

      if (!expr) return null

      let options = {
         cwd: '/home/safe',
      }

      execFile('/usr/bin/ghc',['-ignore-dot-ghci','-e',expr], options, (error, stdout, stderr) => {
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

         ctx.replyWithHTML('<code>'+r+'</code>')

      }

   },

   python: async ctx => {

      let expr = ctx.message.text.split(' ').slice(1).join(' ')

      if (!expr) return null

      let options = {
         cwd: '/home/safe',
      }

      execFile('/usr/bin/python',['-c',expr], options, (error, stdout, stderr) => {
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

         ctx.replyWithHTML('<code>'+r+'</code>')

      }

   }

}
