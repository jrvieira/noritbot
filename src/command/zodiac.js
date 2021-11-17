const util = require('../util')
const { exec } = require('child_process')

module.exports = async ctx => {

   let query = ctx.message.text.split(' ').slice(1).join(' ')

   zodiac = new Map([
      ['aquarius','aquarius'],
      ['aquario','aquarius'],
      ['pisces','pisces'],
      ['peixe','pisces'],
      ['peixes','pisces'],
      ['aries','aries'],
      ['carneiro','aries'],
      ['taurus','taurus'],
      ['touro','taurus'],
      ['gemini','gemini'],
      ['gemeos','gemini'],
      ['cancer','cancer'],
      ['caranguejo','cancer'],
      ['leo','leo'],
      ['leao','leo'],
      ['virgo','virgo'],
      ['virgem','virgo'],
      ['libra','libra'],
      ['balanca','libra'],
      ['scorpio','scorpio'],
      ['escorpiao','scorpio'],
      ['sagittarius','sagittarius'],
      ['sagitario','sagittarius'],
      ['capricorn','capricorn'],
      ['capricornio','capricorn'],
      ['capricornus','capricorn'],
   ])

   let comm = 'curl -s -L https://ohmanda.com/api/horoscope/' + zodiac.get( query.normalize('NFD').replace(/\p{Diacritic}/gu, "") )
   let r
   let caller = await util.title(ctx)

   exec (comm, (error, stdout, stderr) => {
      if (error) {
         console.error(error)
         return run(':(')
      }
      if (stderr) {
         console.error(stderr)
         return run(':(')
      }
      return run(JSON.parse(stdout).horoscope)
   })

   function run (r) {
      ctx.reply(caller + ': ' + r)
   }

}

