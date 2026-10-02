const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const ejs = require('ejs')
const Parser = require('rss-parser')

const app = express()
const parser = new Parser()
const FEED_URL = 'https://thefactfile.org/feed/'
const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public', 'pages'))
app.engine('ejs', ejs.renderFile)
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

async function getPosts() {
  const response = await axios.get(FEED_URL, {
    timeout: 15000,
    headers: { 'User-Agent': 'FactsFeedReader/1.0' },
  })
  const feed = await parser.parseString(response.data)

  return feed.items.map((item) => ({
    title: item.title || 'Untitled fact',
    link: item.link || 'https://thefactfile.org/',
    pubDate: item.isoDate || item.pubDate || '',
    creator: item.creator || item.author || 'Unknown author',
    categories: Array.isArray(item.categories) ? item.categories : [],
    content: item.contentSnippet || item.summary || 'No preview available.',
  }))
}

function getCategories(posts) {
  return [...new Set(posts.flatMap((post) => post.categories))]
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second))
}

function renderFeedError(response, view, extra = {}) {
  response.status(502).render(view, {
    posts: [],
    categories: [],
    filters: { title: '', category: '' },
    message: '',
    error: 'The facts feed is temporarily unavailable. Please try again shortly.',
    ...extra,
  })
}

app.get('/', async (request, response) => {
  try {
    const posts = await getPosts()
    response.render('index', { posts, error: '' })
  } catch (error) {
    console.error('Could not load the RSS feed:', error.message)
    renderFeedError(response, 'index')
  }
})

app.get('/search', async (request, response) => {
  try {
    const posts = await getPosts()
    response.render('search', {
      posts: [],
      categories: getCategories(posts),
      filters: { title: '', category: '' },
      message: '',
      error: '',
    })
  } catch (error) {
    console.error('Could not load search categories:', error.message)
    renderFeedError(response, 'search')
  }
})

app.post('/search/title', async (request, response) => {
  const title = String(request.body.title || '').trim()

  try {
    const allPosts = await getPosts()
    const posts = title
      ? allPosts.filter((post) => post.title.toLowerCase().includes(title.toLowerCase()))
      : []

    response.render('search', {
      posts,
      categories: getCategories(allPosts),
      filters: { title, category: '' },
      message: title ? `Title search: ${posts.length} result(s).` : 'Enter a title to search.',
      error: '',
    })
  } catch (error) {
    console.error('Title search failed:', error.message)
    renderFeedError(response, 'search', { filters: { title, category: '' } })
  }
})

app.post('/search/category', async (request, response) => {
  const category = String(request.body.category || '').trim()

  try {
    const allPosts = await getPosts()
    const posts = category
      ? allPosts.filter((post) =>
          post.categories.some((item) => item.toLowerCase() === category.toLowerCase()),
        )
      : []

    response.render('search', {
      posts,
      categories: getCategories(allPosts),
      filters: { title: '', category },
      message: category
        ? `Category search: ${posts.length} result(s).`
        : 'Choose a category to search.',
      error: '',
    })
  } catch (error) {
    console.error('Category search failed:', error.message)
    renderFeedError(response, 'search', { filters: { title: '', category } })
  }
})

app.use((request, response) => {
  response.status(404).send('Page not found')
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Facts Feed Reader is running at http://localhost:${PORT}`)
  })
}

module.exports = app