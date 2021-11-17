module.exports = {

   title: async (ctx, id = ctx.message.from.id) => {
      try {
         let data = await ctx.getChatAdministrators(ctx.message.chat.id)
         return data.filter(u => u.user.id == id)[0].custom_title
      } catch (e) {
         return ctx.message.from?.first_name || 'someone'
      }
   },
   random: arr => arr[Math.random() * arr.length >> 0],
   maybe: n => n > Math.random()

}
