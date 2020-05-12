const COUCH_URL = 'http://admin:admin@localhost:5984'
const DB = 'choirlesstest_users'
const Nano = require('nano')
const nano = Nano(COUCH_URL)

// the code we're testing
process.env.COUCH_URL = COUCH_URL
process.env.COUCH_USERS_DATABASE = DB
const postUser = require('./postUser.js')
const postUserLogin = require('./postUserLogin.js')
const postUserVerify = require('./postUserVerify.js')
const getUser = require('./getUser.js')

// test users
let rita, sue, bob

beforeAll(async () => {
  await nano.db.create(DB)
})

afterAll(async () => {
  await nano.db.destroy(DB)
})

test('postUserLogin - missing parameters #1', async () => {
  const obj = {
    name: 'Frank',
    email: 'frank@aol.com'
  }
  const response = await postUser(obj)
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('postUserLogin - missing parameters #2', async () => {
  const obj = {
    name: 'Frank',
    password: 'pies'
  }
  const response = await postUser(obj)
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('postUserLogin - missing parameters #3', async () => {
  const obj = {
    email: 'frank@aol.com',
    password: 'pies'
  }
  const response = await postUser(obj)
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('postUser - create user', async () => {
  let obj = {
    name: 'Bob',
    email: 'bob@aol.com',
    password: 'sausages'
  }
  let response = await postUser(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  bob = response.body.userId

  obj = {
    name: 'Sue',
    email: 'sue@aol.com',
    password: 'cakes'
  }
  response = await postUser(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  sue = response.body.userId

  obj = {
    name: 'Rita',
    email: 'rita@aol.com',
    password: 'rabbits'
  }
  response = await postUser(obj)
  expect(response.statusCode).toBe(200)
  rita = response.body.userId
})

test('getUser - fetch user', async () => {
  let response = await getUser({ userId: bob })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  response = await getUser({ userId: sue })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  response = await getUser({ userId: rita })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
})

test('getUser - fetch user - invalid user', async () => {
  const response = await getUser({ userId: 'frank' })
  expect(response.statusCode).toBe(404)
  expect(response.body.ok).toBe(false)
})

test('getUser - fetch user - missing userId', async () => {
  const response = await getUser({})
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('postUserLogin - login user', async () => {
  const response = await postUserLogin({ email: 'rita@aol.com', password: 'rabbits' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(response.body.user.type).toBe('user')
  expect(response.body.user.name).toBe('Rita')
  expect(response.body.user.email).toBe('rita@aol.com')
  expect(response.body.user.password).toBe(undefined)
  expect(response.body.user.salt).toBe(undefined)
  expect(response.body.user.verified).toBe(false)
})

test('postUserLogin - login user - invalid user', async () => {
  const response = await postUserLogin({ email: 'frita@aol.com', password: 'rabbits' })
  expect(response.statusCode).toBe(403)
  expect(response.body.ok).toBe(false)
})

test('postUserLogin - login user - wrong password', async () => {
  const response = await postUserLogin({ email: 'rita@aol.com', password: 'rabbitss' })
  expect(response.statusCode).toBe(403)
  expect(response.body.ok).toBe(false)
})

test('postUser - change name', async () => {
  const response = await postUser({ userId: rita, name: 'Rita Smith' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
})

test('postUser - change email', async () => {
  const response = await postUser({ userId: rita, email: 'rita2@aol.com' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
})

test('postUser - change password', async () => {
  const response = await postUser({ userId: rita, password: 'rabbits2' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
})

test('postUserLogin - login user after changes', async () => {
  const response = await postUserLogin({ email: 'rita2@aol.com', password: 'rabbits2' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(response.body.user.type).toBe('user')
  expect(response.body.user.name).toBe('Rita Smith')
  expect(response.body.user.email).toBe('rita2@aol.com')
  expect(response.body.user.password).toBe(undefined)
  expect(response.body.user.salt).toBe(undefined)
  expect(response.body.user.verified).toBe(false)
})

test('postUserVerify - set verified', async () => {
  const response = await postUserVerify({ userId: rita })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
})

test('postUserVerify - set verified - missing userId', async () => {
  const response = await postUserVerify({ })
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('postUserLogin - login user after verification', async () => {
  const response = await postUserLogin({ email: 'rita2@aol.com', password: 'rabbits2' })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(response.body.user.type).toBe('user')
  expect(response.body.user.name).toBe('Rita Smith')
  expect(response.body.user.email).toBe('rita2@aol.com')
  expect(response.body.user.password).toBe(undefined)
  expect(response.body.user.salt).toBe(undefined)
  expect(response.body.user.verified).toBe(true)
})

test('getUser - get profile', async () => {
  const response = await getUser({ userId: rita })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(response.body.user.type).toBe('user')
  expect(response.body.user.name).toBe('Rita Smith')
  expect(response.body.user.email).toBe('rita2@aol.com')
  expect(response.body.user.password).toBe(undefined)
  expect(response.body.user.salt).toBe(undefined)
  expect(response.body.user.verified).toBe(true)
  expect(response.body.choirs.length).toBe(0)
})

test('getUser - get profile - invalid user', async () => {
  const response = await getUser({ userId: 'frank' })
  expect(response.statusCode).toBe(404)
  expect(response.body.ok).toBe(false)
})
