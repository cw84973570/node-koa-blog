const signup = require('./signup')
const signin = require('./signin')
const signout = require('./signout')
const posts = require('./posts')
const comments = require('./comments')

const Router = require('koa-router')
const router = new Router()

module.exports = function (app) {
  router.get('/', function (ctx) {
    ctx.redirect('/posts')
  })
  app.use(router.routes()).use(router.allowedMethods())
  app.use(signup.routes()).use(signup.allowedMethods()) // 注册
  app.use(signin.routes()).use(signin.allowedMethods()) // 登录
  app.use(signout.routes()).use(signout.allowedMethods()) // 登出
  app.use(posts.routes()).use(posts.allowedMethods()) // 文章
  app.use(comments.routes()).use(comments.allowedMethods()) // 评论
  app.use(async (ctx, next, err) => {
    console.log(ctx)
    console.log(ctx.headerSent)
    console.log(err)
    if (!ctx.headerSent) {
      ctx.status = 404
      await ctx.render('404')
    }
  })
}
// const Router = require('koa-router')
// module.exports = new Router ()
