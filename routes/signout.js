// 登出页
const Router = require('koa-router')
const router = new Router({ prefix: '/signout' })

const checkLogin = require('../middlewares/check').checkLogin

// GET /signout 登出
router.get('/', checkLogin, async (ctx, next) => {
  // 清空用户信息
  ctx.session.user = null
  ctx.flash('success', '登出成功')
  // 跳转到主页
  await ctx.redirect('/posts')
})

module.exports = router
