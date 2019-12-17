// 登录
const Router = require('koa-router')
const router = new Router({ prefix: '/signin' })
const sha1 = require('sha1')

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signin 登录页
router.get('/', checkNotLogin, async (ctx, next) => {
  await ctx.render('signin')
})

// POST /signin 用户登录
router.post('/', checkNotLogin, async (ctx, next) => {
  const name = ctx.req.fields.name
  const password = ctx.req.fields.password

  // 校验参数
  try {
    if (!name.length) {
      throw new Error('请填写用户名')
    }
    if (!password.length) {
      throw new Error('请填写密码')
    }
  } catch (err) {
    ctx.flash('error', err.message)
    return ctx.redirect('back')
  }

  try {
    const user = await UserModel.getUserByName(name)
    if (!user) {
      throw new Error('用户不存在')
    } else if (sha1(password) !== user.password) {
      throw new Error('用户名或密码错误')
    }
    ctx.flash('success', '登录成功')
    // 用户信息写入 session
    delete user.password
    ctx.session.user = user
    // 跳转到主页
    await ctx.redirect('/posts')
  } catch (err) {
    ctx.flash('error', err.message)
    await ctx.redirect('back')
  }
})

module.exports = router
