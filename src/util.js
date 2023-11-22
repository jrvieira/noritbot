module.exports = {

   // get admin title of sender

   title: async (ctx, id = ctx.message.from.id) => {
      try {
         let data = await ctx.getChatAdministrators(ctx.message.chat.id)
         return data.filter(u => u.user.id == id)[0].custom_title
      } catch (e) {
         return ctx.message.from?.first_name || 'someone'
      }
   },

   // choose random item from array

   random: arr => arr[Math.random() * arr.length >> 0],

   // return true with a chance of n (default 0.5)

   maybe: (n = .5) => n > Math.random(),

   // timer is a better setTimeout without 32bit signed int limitation

   timer: (f, t) => {

      t = t < 0 ? 0 : t

      if (t >= 2**31) {
         setTimeout(() => timer(f, t - 2**31 + 1), 2**31 - 1)
      } else {
         setTimeout(f, t)
      }

   }

}
