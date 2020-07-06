const COUCH_URL = 'http://admin:admin@localhost:5984'
const ts = new Date().getTime()
const DB1 = 'invitationtest_' + ts
const Nano = require('nano')
const nano = Nano(COUCH_URL)

// the code we're testing
process.env.COUCH_URL = COUCH_URL
process.env.COUCH_INVITATION_DATABASE = DB1
const postInvitation = require('./postInvitation.js')
const getInvitation = require('./getInvitation.js')
const getInvitationList = require('./getInvitationList.js')
const deleteInvitation = require('./deleteInvitation.js')

let id1, id2, id3

beforeAll(async () => {
  await nano.db.create(DB1)
})

afterAll(async () => {
  await nano.db.destroy(DB1)
})

test('postInvitation - missing parameters #1', async () => {
  const obj = {
    invitee: 'bob@aol.com',
    choirId: 'xyz123'
  }
  const response = await postInvitation(obj)
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('postInvitation - create invitations', async () => {
  let obj = {
    creator: 'abc123',
    invitee: 'bob@aol.com',
    choirId: 'xyz123'
  }
  let response = await postInvitation(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.id).toBe('string')
  id1 = response.body.id

  obj = {
    creator: 'abc123',
    choirId: 'xyz123'
  }
  response = await postInvitation(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.id).toBe('string')
  id2 = response.body.id

  obj = {
    creator: 'abc123',
    invitee: 'sue@aol.com'
  }
  response = await postInvitation(obj)
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.id).toBe('string')
  id3 = response.body.id
})

test('getInvitation - check', async () => {
  let response = await getInvitation({ inviteId: id1 })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.invitation).toBe('object')

  response = await getInvitation({ inviteId: id2 })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.invitation).toBe('object')

  response = await getInvitation({ inviteId: id3 })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(typeof response.body.invitation).toBe('object')
})

test('getInvitation - invalid', async () => {
  const response = await getInvitation({ inviteId: 'nonsense' })
  expect(response.statusCode).toBe(404)
  expect(response.body.ok).toBe(false)
})

test('deleteInvitation - remove invitation by id', async () => {
  let response = await deleteInvitation({ inviteId: id3 })
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)

  response = await getInvitation({ inviteId: id3 })
  expect(response.statusCode).toBe(404)
  expect(response.body.ok).toBe(false)
})

test('deleteInvitation - invalid id', async () => {
  const response = await getInvitation({ inviteId: 'nonsense' })
  expect(response.statusCode).toBe(404)
  expect(response.body.ok).toBe(false)
})

test('deleteInvitation - missing id', async () => {
  const response = await getInvitation({ })
  expect(response.statusCode).toBe(400)
  expect(response.body.ok).toBe(false)
})

test('getInvitationList - check', async () => {
  const response = await getInvitationList()
  expect(response.statusCode).toBe(200)
  expect(response.body.ok).toBe(true)
  expect(response.body.invitations.length).toBe(2)
  expect(typeof response.body.invitations[0]).toBe('object')
})
