const util = require('../util')

module.exports = async ctx => {

   let caller = await util.title(ctx)
   let reminder = 0
   let expr = ctx.message.text.split(' ').slice(1)

   for (let e of expr) {

      let n = e.slice(0,-1)
      let t = e.slice(-1)

      if (!isNaN(+n)) {
         switch (t) {
            case 'd':
               reminder += n * 1000 * 60 * 60 * 24;
               break;
            case 'h':
               reminder += n * 1000 * 60 * 60;
               break;
            case 'm':
               reminder += n * 1000 * 60;
               break;
            default:
               reminder = 0;
         }
      } else {
         return run(':(')
      }

   }

   let origin = Date.now()

   function format (ts) {

      let date = new Date(ts)
      let [month, day, hour, minute] = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]
      let months = ['Jan','Feb','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

      return months[month] + ' ' + day + ' ' + (hour).toString().padStart(2,'0') + ':' + (minute).toString().padStart(2,'0')

   }

   // setReminder is a better setTimeout without 32bit signed int limitation
   function setReminder (f, t) {

      t = t < 0 ? 0 : t

      if (t >= 2**31) {
         setTimeout(() => setReminder(f, t - 2**31 + 1), 2**31 - 1)
      } else {
         setTimeout(f, t)
      }

   }

   if (reminder >= 1000 * 60) {

      setReminder(() => runReply(), reminder)
      let target = origin + reminder
      //run('reminding @ ' + format(target) + ' UTC')
      run('ok')
      console.info('reminding @', reminder, ctx.message.message_id)

   } else {

      return run(':(')

   }

   function run (r) {
      ctx.reply(caller + ': ' + r)
   }

   function runReply () {
      ctx.telegram.sendMessage(ctx.message.chat.id, 'reminder from ' + caller, {
      // reply_to_message_id: ctx.message?.reply_to_message?.message_id || ctx.message.message_id,
         reply_to_message_id: ctx.message.message_id,
         allow_sending_without_reply: false // this is not working
      })
   }

}
