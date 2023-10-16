const { execFile } = require('child_process')

module.exports = {

   javascript: async ctx => {

      let expr = ctx.message.text.split(' ').slice(1).join(' ')

      if (!expr) return null

      let options = {
         cwd: '/home/safe',
         shell: '/bin/rbash',
         detached: true,
         timeout: 2700,
      }

      execFile('node',['-p',JSON.stringify(expr)], options, (error, stdout, stderr) => {
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
         timeout: 2700,
      }

      execFile('ghc',['-ignore-dot-ghci','-e',expr], options, (error, stdout, stderr) => {
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
         timeout: 2700,
      }

      execFile('python',['-c',expr], options, (error, stdout, stderr) => {
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

   j: async ctx => {

      let expr = ctx.message.text.split(' ').slice(1).join(' ')

      if (!expr) return null

      let options = {
         cwd: '/home/safe',
         timeout: 2700,
      }

      const child = execFile('ijconsole',['-js'], options, (error, stdout, stderr) => {
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

      child.stdin.write(expr)
      child.stdin.end()

   },

   sc: async ctx => {

      let expr = ctx.message.text.split(' ').slice(1).join(' ')

      if (!expr) return null

      let options = {
         cwd: '/home/safe',
         timeout: 2700,
      }

      const child = execFile('petite',['-q'], options, (error, stdout, stderr) => {
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

      child.stdin.write(expr)
      child.stdin.end()

      function run (r) {

         ctx.replyWithHTML('<code>'+r+'</code>')

      }

   },

}
