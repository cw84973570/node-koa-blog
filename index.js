const path = require('path')
const Koa = require('koa')
const session = require('koa-session')
// const MongoStore = require('connect-mongo')
const MongoStore = require('koa-session-mongo2')
// const flash = require('connect-flash')
const flash = require('koa-connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
const render = require('koa-ejs')
// const co = require('co')
// const views = require('koa-views') // 渲染模板中间件
const serve = require('koa-static') // 读取静态文件
const koaForm = require('formidable-upload-koa') // 上传头像
const { accessLogger, systemLogger } = require('./logger')

const app = new Koa()

app.use(accessLogger())
// session 中间件
// app.use(session({
//   key: config.session.key, // 设置 cookie 中保存 session id 的字段名称
//   maxAge: config.session.maxAge, // 过期时间，过期后cookie中的session id自动删除
//   secret: config.session.secret, // 通过设置secret 来计算 hash值并放在cookie中，使产生的 signedCookie防篡改
//   renew: true, // 强制更新 session
//   signed: false, // 设置为false，强制创建一个session，即使用户未登录
//   store: new MongoStore({ // 将 session 存储到 mongodb
//     useNewUrlParser: true,
//     url: config.mongodb, // mongodb 地址
//     db: 'myblog',
//   })
// }, app))

// app.use(async (ctx, next) => {
//   console.log(ctx.state, '----------------')
//   Object.assign(ctx.state, ctx.session)
//   await next()
// })
// 设置模板引擎
// app.use(views(path.join(__dirname, 'views'), {
//   extension: 'ejs'
// }))
render(app, {
  root: path.join(__dirname, 'views'),
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: false
})
// app.context.render = co.wrap(app.context.render)

// 设置静态文件目录
app.use(serve(path.join(__dirname, 'public')))

// session 中间件
app.use(session({
  key: config.session.key, // 设置 cookie 中保存 session id 的字段名称
  maxAge: config.session.maxAge, // 过期时间，过期后cookie中的session id自动删除
  secret: config.session.secret, // 通过设置secret 来计算 hash值并放在cookie中，使产生的 signedCookie防篡改
  renew: true, // 强制更新 session
  signed: false, // 设置为false，强制创建一个session，即使用户未登录
  store: new MongoStore({ // 将 session 存储到 mongodb
    useNewUrlParser: true,
    url: config.mongodb, // mongodb 地址
    db: 'myblog',
  })
}, app))


// flash 中间件，用来显示通知
app.use(flash())

// 上传文件
app.use(koaForm({
  uploadDir: path.join(__dirname, 'public/img'),
  keepExtensions: true
}))

// 模板全局常量
app.use(async (ctx, next) => {
  ctx.state.blog = {
    title: pkg.name,
    description: pkg.description
  }
  await next()
})

// 添加模板变量
app.use(async (ctx, next) => {
  ctx.state.user = ctx.session.user
  ctx.state.success = ctx.flash('success').toString()
  ctx.state.error = ctx.flash('error').toString()
  await next()
})
// 模板全局常量
// app.context.state.blog = {
//   title: pkg.name,
//   description: pkg.description
// }
// Object.defineProperty(app.context, 'state', {
//   get: function() {
//     return {
//       blog: {
//         title: pkg.name,
//         description: pkg.description
//       }
//     }
//   },
//   set: function () {
//     return {
//       blog: {
//         title: pkg.name,
//         description: pkg.description
//       }
//     }
//   }
//  });
// console.log(app.context)
// app.context = { state: {} }
// app.context.state.blog = {
//   title: pkg.name,
//   description: pkg.description
// }
// 路由
routes(app)

app.on('error', async (err, ctx) => {
  logger.error(err)
  // console.error('--------------------', err)
})
// 监听端口,启动程序
if (module.parent) {
  // 被 require，则导出 app
  module.exports = app
} else {
  // 监听端口，启动程序
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`)
  })
}
