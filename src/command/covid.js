const { execFile } = require('child_process')

module.exports = async ctx => {

   let expr = ctx.message.text.split(' ').slice(1).join(' ') || 'portugal'

   let options = {
      cwd: '/home/safe',
   }

   execFile('/usr/local/bin/corona',['-j',expr], options, (error, stdout, stderr) => {
      if (error) {
         console.error(error)
         return run(':(')
      }
      // this package has terrible error handling
      // if (stderr) {
      //    console.error(stderr)
      //    return run(':(')
      // }
      return run(stdout)
   })

   function run (s) {

      let j = JSON.parse(s)

      let r = `${j[1]['Country']}
<code>
total: ${j[1]['Cases'].toLocaleString('eu')} / ${j[0]['Cases'].toLocaleString('eu')}
p/Mil: ${j[1]['Per Million'].toLocaleString('eu')} / ${j[0]['Per Million'].toLocaleString('eu')}

diario: ${j[1]['Cases (today)'].toLocaleString('eu')} / ${j[0]['Cases (today)'].toLocaleString('eu')}

ativos: ${j[1]['Active'].toLocaleString('eu')} / ${j[0]['Active'].toLocaleString('eu')}
graves: ${j[1]['Critical'].toLocaleString('eu')} / ${j[0]['Critical'].toLocaleString('eu')}
mortes: ${j[1]['Deaths (today)'].toLocaleString('eu')} / ${j[0]['Deaths (today)'].toLocaleString('eu')}
</code>`

      ctx.replyWithHTML(r)

   }

}
