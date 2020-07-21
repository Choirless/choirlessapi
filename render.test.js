const COUCH_URL = 'http://admin:admin@localhost:5984'
const ts = new Date().getTime()
const DB1 = 'rendertest_' + ts
const Nano = require('nano')
const nano = Nano(COUCH_URL)

// the code we're testing
process.env.COUCH_URL = COUCH_URL
process.env.COUCH_RENDER_DATABASE = DB1
const postRender = require('./postRender.js')
const getRender = require('./getRender.js')

// pause
const sleep = async (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

beforeAll(async () => {
  await nano.db.create(DB1)
})

afterAll(async () => {
  await nano.db.destroy(DB1)
})

test('postRender - missing parameters #1', async () => {
  const obj = {
    choirId: 'xyz123'
  }
  const response = await postRender(obj)
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('postRender - missing parameters #2', async () => {
  const obj = {
    songId: 'xyz123'
  }
  const response = await postRender(obj)
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('postRender - create render status', async () => {
  let obj = {
    choirId: 'abc123',
    songId: 'mno456'
  }
  let response = await postRender(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)

  obj = {
    choirId: 'abc123',
    songId: 'xyz789'
  }
  response = await postRender(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)

  obj = {
    choirId: 'abc123',
    songId: 'zzz789'
  }
  response = await postRender(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)

  await sleep(1000)
  response = await getRender({ choirId: 'abc123', songId: 'xyz789' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.render).toBe('object')
  expect(response.body.render.status).toBe('new')
})

test('getRender - check non-existant song', async () => {
  const response = await getRender({ choirId: 'abc123', songId: 'mmmm' })
  expect(response.statusCode).toBe(404)
  expect(response.body.ok).toBe(false)
})

test('getRender - check non-existant choir', async () => {
  const response = await getRender({ choirId: 'iiii', songId: 'xyz789' })
  expect(response.statusCode).toBe(404)
  expect(response.body.ok).toBe(false)
})

test('postRender - updater status #1', async () => {
  const obj = {
    choirId: 'abc123',
    songId: 'xyz789',
    status: 'converted'
  }
  let response = await postRender(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  await sleep(1000)
  response = await getRender({ choirId: 'abc123', songId: 'xyz789' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.render).toBe('object')
  expect(response.body.render.status).toBe('converted')
})

test('postRender - updater status #2', async () => {
  const obj = {
    choirId: 'abc123',
    songId: 'xyz789',
    status: 'aligned'
  }
  let response = await postRender(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  await sleep(1000)
  response = await getRender({ choirId: 'abc123', songId: 'xyz789' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.render).toBe('object')
  expect(response.body.render.status).toBe('aligned')
})

test('postRender - updater status #3', async () => {
  const obj = {
    choirId: 'abc123',
    songId: 'xyz789',
    status: 'rendered'
  }
  let response = await postRender(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  await sleep(1000)
  response = await getRender({ choirId: 'abc123', songId: 'xyz789' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.render).toBe('object')
  expect(response.body.render.status).toBe('rendered')
})

test('postRender - invalid status', async () => {
  const obj = {
    choirId: 'abc123',
    songId: 'xyz789',
    status: 'sausages'
  }
  const response = await postRender(obj)
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})
