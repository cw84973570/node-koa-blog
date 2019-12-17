// 权限控制
module.exports = {
  checkLogin: async (ctx, next) => { // 未登陆跳转到登陆页面
    console.log('session-------------------', ctx.session)
    if (!ctx.session.user) {
      ctx.flash('error', '未登录')
      return ctx.redirect('/signin')
    }
    await next()
    // ctx.flash() // 清空flash
  },
  checkNotLogin: async (ctx, next) => { // 已登陆防止访问登陆页面
    console.log('session-------------------', ctx.session)
    if (ctx.session.user) {
      ctx.flash('error', '已登录')
      return ctx.redirect('back')// 返回之前的页面
    }
    await next()
    // ctx.flash() // 清空flash
  }
}
