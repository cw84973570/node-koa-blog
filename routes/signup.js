// 注册页面
const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const router = new Router({ prefix: '/signup' })

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signup 注册页
router.get('/', checkNotLogin, async (ctx, next) => {
  console.log('注册页')
  // 要异步渲染
  await ctx.render('signup', { user: 'ned' })
})

// POST /signup 用户注册
router.post('/', checkNotLogin, async (ctx, next) => {
  console.log(ctx.req.fields)
  const name = ctx.req.fields.name
  const gender = ctx.req.fields.gender
  const bio = ctx.req.fields.bio
  const avatar = ctx.req.files.avatar.path.split(path.sep).pop()
  let password = ctx.req.fields.password
  const repassword = ctx.req.fields.repassword
  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名字请限制在 1-10 个字符')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('性别只能是 m、f 或 x')
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('个人简介请限制在 1-30 个字符')
    }
    if (!ctx.req.files.avatar.name) {
      throw new Error('缺少头像')
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符')
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致')
    }
  } catch (err) {
    // console.log('校验不通过----------------------------', err.message)
    // 注册失败，异步删除上传的头像
    fs.unlink(ctx.req.files.avatar.path, err => { if (err) throw err })
    ctx.flash('error', err.message)
    return ctx.redirect('/signup')
  }

  // 明文密码加密
  password = sha1(password)

  // 待写入数据库的用户信息
  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  }
  try {
    // 用户信息写入数据库
    const result = await UserModel.create(user)
    // 此 user 是插入 mongodb 后的值，包含 _id
    user = result.ops[0]
    // 删除密码这种敏感信息，将用户信息存入 session
    delete user.password
    ctx.session.user = user
    // 写入 flash
    console.log('注册成功')
    ctx.flash('success', '注册成功')
    console.log(ctx.session)
    // 跳转到首页
    await ctx.redirect('/posts')
  } catch (err) {
    // 注册失败，异步删除上传的头像
    fs.unlink(ctx.req.files.avatar.path, err => { if (err) throw err })
    // 用户名被占用则跳回注册页，而不是错误页
    if (err.message.match('duplicate key')) {
      console.log('用户名已被占用')
      ctx.flash('error', '用户名已被占用')
    } else {
      ctx.flash('error', err.message)
    }
    await ctx.redirect('/signup')
  }
})

module.exports = router
