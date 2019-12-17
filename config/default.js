// config-lite 根据环境变量加载不同的config配置文件
module.exports = {
  port: 3000,
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: '2592000000'
  },
  mongodb: 'mongodb://localhost:27017/myblog'
}
