// 评论
const Router = require('koa-router')
const router = new Router({ prefix: '/comments' })
const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')

// POST /comments 创建一条留言
router.post('/', checkLogin, async function (ctx, next) {
  const author = ctx.session.user._id
  const postId = ctx.req.fields.postId
  const content = ctx.req.fields.content
  // 校验参数
  try {
    if (!content.length) {
      throw new Error('请填写留言内容')
    }
  } catch(err) {
    ctx.flash('error', err.message)
    return ctx.redirect('back')
  }
  const comment = {
    author: author,
    postId: postId,
    content: content
  }
  try {
    await CommentModel.create(comment)
    ctx.flash('success', '留言成功')
    // 留言成功后跳转到上一页
    await ctx.redirect('back')
  } catch(err) {
    ctx.flash('error', err.message)
    await ctx.redirect('/posts')
  }
  // ctx.body = '创建留言'
})

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', checkLogin, async function (ctx, next) {
  const commentId = ctx.params.commentId
  const author = ctx.session.user._id

  const comment = await CommentModel.getCommentById(commentId)
  try {
    if (!comment) {
      throw new Error('留言不存在')
    } else if (comment.author.toString() !== author.toString()) {
      throw new Error('没有权限删除留言')
    }
    await CommentModel.delCommentById(commentId)
    ctx.flash('success', '删除留言成功')
    // 删除成功后跳转到上一页
    await ctx.redirect('back')
  } catch (err) {
    ctx.flash('error', err.message)
    await ctx.redirect('/posts')
  }
  // ctx.body = '删除留言'
})

module.exports = router
