import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import 'highlight.js/styles/idea.css'
import styles from './BlogPreview.module.css'
import type { Blog } from '../../pages/Blog/Blog'
import { Link } from 'react-router-dom'
import Tag from '../Tag/Tag'
import { useAppDispatch } from '../../hooks/redux'
import { updateBlog } from '../../stores/blog/blogSlice'

interface Props {
  blog: Blog
}

const BlogPreview = ({ blog }: Props) => {
  const [preview, setPreview] = useState('')
  const dispatch = useAppDispatch()
  const date = new Date(blog.date)

  useEffect(() => {
    const pieces = blog.markdown.split('<!--truncate-->')
    setPreview(pieces[0])
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((el: any) => {
        hljs.highlightElement(el)
        el.style.padding = 0
      })
    }, 0)
    dispatch(updateBlog({ ...blog, markdown: pieces[0] + pieces[1] }))
  }, [])

  return (
    <div className={styles.preview}>
      <h1><Link to={`/blog/${blog._id}`}>{blog.title}</Link></h1>
      <p className={styles.est}>{date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日 · 预计阅读时间 {Math.round(blog.markdown.length / 200)} min</p>
      <div className={styles.author}>
        <img width='48' height='48' src={`https://avatars.githubusercontent.com/${blog.author_gh}?s=256`} />
        <div>
          <a className={styles.avatar_name} href={`https://github.com/${blog.author_gh}`} target="_blank" rel="noopener noreferrer">
            {blog.author_gh}
          </a>
          <small>{blog.author_description}</small>
        </div>
      </div>
      <ReactMarkdown className={styles.markdown_body + ' markdown-body'} children={preview} remarkPlugins={[remarkGfm]} />
      <div className={styles.article_footer}>
        <div>
          <strong>标签：</strong>
          {
            blog.tag.map((t, i) => {
              return <Tag key={i} to=''>{t}</Tag>
            })
          }
        </div>
        <Link to={`/blog/${blog._id}`}>阅读全文</Link>
      </div>
    </div>
  )
}

export default BlogPreview