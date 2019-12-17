// const koa = require('koa')

const Router = require('koa-router')

const router = new Router({ prefix: '/posts' })

const checkLogin = require('../middlewares/check').checkLogin

const PostModel = require('../models/posts')

const CommentModel = require('../models/comments')

// GET /posts 所有用户或特定用户的文章页
router.get('/', async (ctx, next) => {
  const author = ctx.query.author
  console.log('author', author)
  try {
    const posts = await PostModel.getPosts(author)
    await ctx.render('posts', {
      posts: posts
    })
  } catch (err) {
    ctx.flash('error', err.message)
    await ctx.redirect('/posts')
  }
})

// POST /posts/create 发表文章
router.post('/create', checkLogin, async (ctx, next) => {
  const author = ctx.session.user._id
  const title = ctx.req.fields.title
  const content = ctx.req.fields.content

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch(err) {
    // console.log('post/create', e.message)
    ctx.flash('error', err.message)
    return ctx.redirect('back')
  }
  let post = {
    author: author,
    title: title,
    content: content
  }
  try {
    const result = await PostModel.create(post)
    post = result.ops[0]
    ctx.flash('success', '发表成功')
    // 发表成功后跳转到该文章页
    await ctx.redirect(`/posts/${post._id}`)
  } catch (err) {
    ctx.flash('error', err.message)
    await ctx.redirect('/posts')
  }
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, async (ctx, next) => {
  await ctx.render('create')
})

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', async (ctx, next) => {
  const postId = ctx.params.postId
  try {
    const result = await Promise.all([
      PostModel.getPostById(postId), // 获取文章信息
      CommentModel.getComments(postId), // 获取该文章所有留言
      PostModel.incPv(postId) // pv 加 1
    ])
    const post = result[0]
    const comments = result[1]
    if (!post) {
      throw new Error('该文章不存在')
    }
    await ctx.render('post', {
      post: post,
      comments: comments
    })
  } catch (err) {
    ctx.flash('error', err.message)
    await ctx.redirect('/posts')
  }
  // ctx.body = '文章详情页'
})

// GET /posts/:postId/edit 更新文章的页面
router.get('/:postId/edit', checkLogin, async (ctx, next) => {
  const postId = ctx.params.postId
  const author = ctx.session.user._id
  console.log('postId', postId)
  console.log('author', author)
  try {
    const post = await PostModel.getRawPostById(postId)
    if (!post) {
      throw new Error('该文章不存在')
    } else if (author.toString() !== post.author._id.toString()) {
      throw new Error('权限不足')
    }
    await ctx.render('edit', { post: post })
  } catch (err) {
    ctx.flash('error', err.message)
    await ctx.redirect('/posts')
  }
  // ctx.body = '更新文章页'
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, async (ctx, next) => {
  const postId = ctx.params.postId
  const author = ctx.session.user._id
  const title = ctx.req.fields.title
  const content = ctx.req.fields.content
  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (err) {
    ctx.flash('error', err.message)
    return ctx.redirect('back')
  }
  try {
    const post = await PostModel.getRawPostById(postId)
    if (!post) {
      throw new Error('文章不存在')
    } else if (post.author._id.toString() !== author.toString()) {
      throw new Error('没有权限')
    }
    await PostModel.updatePostById(postId, { title: title, content: content })
    ctx.flash('success', '编辑文章成功')
    // 编辑成功后跳转到上一页
    await ctx.redirect(`/posts/${postId}`)
  } catch (err) {
    ctx.flash('error', err.message)
    return ctx.redirect('/posts')
  }
  // ctx.body = '更新文章'
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, async (ctx, next) => {
  const postId = ctx.params.postId
  const author = ctx.session.user._id

  const post = await PostModel.getRawPostById(postId)
  try {
    if (!post) {
      throw new Error('文章不存在')
    } else if (post.author._id.toString() !== author.toString()) {
      throw new Error('没有权限')
    }
    await PostModel.delPostById(postId, author)
    ctx.flash('success', '删除文章成功')
    // 删除成功后跳转到主页
    await ctx.redirect('/posts')
  } catch (err) {
    ctx.flash('error', err.message)
    await ctx.redirect('/posts')
  }
  // ctx.body = '删除文章'
})

module.exports = router
