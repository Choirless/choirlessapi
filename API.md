# Choirless API

## API Keys

Each of the endpoints below require a valid API key to be passed as a query parameter like so `?apikey=<YOUR_API_KEY>`. 

An API key can be generated at the `/keys` endpoint of the API server.

## User

### GET /user

Fetch a user by known userId and the choirs they have joined.

Parameters:

- `userId` - the user to fetch

Returns

```js
{
  ok: true,
  user: { ... user document ... },
  choirs: [ { ... choir doc ..., ... choir doc ... }]
}
```

### POST /user

Create a new user or edit an existing one.

Parameters:

- `userId` - if omitted a new user is generated.
- `name` - name of user (required for new user).
- `password` - password  (required for new user).
- `email` - email address of user (required for new user).
- `verified` - whether the user is verified or not.
- `userType` - the userType (regular/admin)

Returns:

```js
{
  ok: true,
  userId: '<id of user>'
}
```

> Note: if an attempt is made to create/edit a user with an email that already exists in the database, this API will provide a `409` response.

### POST /user/login

Log in a user with a supplied email and password. If the user exists and the password checks out, the user profile is returned.

Parameters:

- `email` - user email address
- `password` - user password

looks for user with matching email address and checks the supplied password == sha256(salt + password).

Returns:

```js
{
  ok: true,
  user : { ... user doc ... },
  choirs: [ { choir1 }. { choir 2 } ]
}
```

### GET /user/choirs

Get a list of the choirs that a user is a member of

Parameters:

- `userId` - user id

Returns:

```js
{
  ok: true,
  choirs: [ { choir1 }. { choir 2 } ]
}
```

### GET /user/byemail

Get a user from their email address

Parameters:

- `email` - the email address of the user (required)

Returns:

```js
{
  ok: true,
  user: { ... user object ... }
}
```

## Choir

### GET /choir

Fetch a choir by known choirId.

Parameters:

- `choirId` - the choir to fetch

Returns

```js
{
  ok: true,
  choir: { ... choir doc ... }
}
```

### POST /choir

Create a new choir or edits an existing one.

Parameters:

- `choirId` - if omitted a new choir is generated.
- `name` - name of choir. (required for new choirs)
- `description` - description of choir.
- `createdByUserId` - id of user creating the choir. (required for new choirs)
- `createdByName` - name of user creating the choir. (required for new choirs)
- `choirType` - one of `private`/`public`. (required for new choirs)

Returns:

```js
{
  ok: true
}
```

### GET /choir/members

Fetch a list of the members of a choir.

Parameters:

- `choirId` - the choir to fetch

Returns

```js
{
  ok: true,
  members: [ { ... choir member doc ... } ]
}
```

### POST /choir/join

Add a user to a choir

Parameters:

- `choirId` - the choir to join
- `userId` - the user joining the choir
- `name` - the name of the user joining the choir
- `memberType` - one of `leader`/`member`

Returns

```js
{
  ok: true
}
```

### POST /choir/song

Add/Edit a choir's song

Parameters:

- `choirId` - the id of the choir (required)
- `userId` - the id of the user adding the song (required)
- `name` - the name of the song (required)
- `description` - a description of a song
- `partNames` - an array of song partNames (add only) - if supplied during creation of a new song, the `partNames` array is converted into `partNames: [ { partNameId: '<uuid>', name: '<name>'}]` format. Editing of this array is achieved using `POST /choir/songPartName` & `DELETE /choir/songPartName`.

Returns

```js
{
  ok: true,
  songId: '<id of song>'
}
```

### GET /choir/song

Get a choir's song by id

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)

Returns

```js
{
  ok: true,
  song: { ... song document ... }
}
```

### DELETE /choir/song

Delete a choir's song and all its song parts

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)

Returns

```js
{
  ok: true
}
```

### GET /choir/songs

Get a list of a choir's songs

Parameters:

- `choirId` - the id of the choir (required)

Returns

```js
{
  ok: true,
  songs: [{ ... song document ... }, { ... song document ... }]
}
```

### POST /choir/songPartName

Add a song partName to the `partNames` array within a song document.

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)
- `partNameId` - the id of the song partName - if matches existing partNameId, that object will be updated, otherwise - new array element will be added and an ID will be generated
- `name` - the name of the part (required)

### DELETE /choir/songPartName

Deletes a partName from a song document

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)
- `partNameId` - the id of the song partName (required)

### POST /choir/songpart

Insert/update a song part

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)
- `partId` - the id of the part (required for updates, if omitted a new song part is created)
- `partNameId` - the id of the part name
- `partName` - name of the part e.g. drums, alto
- `partType` - one of `backing`/`reference`/`rendition`
- `userId` - the id of the user (required for new parts)
- `userName` - the name of the user (required for new parts)
- `offset` - the number of milliseconds after the reference part that this recording started (default 0)
- `aspectRadio` - the aspect ratio of the video e.g. `4:3`
- `hidden` - boolean indicating whether this part is to be hidden in the final mix e.g. `false`

Returns

```js
{
  ok: true,
  partId: '<songpart id>'
}
```

### GET /choir/songpart

Get a single songpart

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)
- `partId` - the id of the part (required)

Returns

```js
{
  ok: true,
  part: { ... part doc ... }'
}
```


### DELETE /choir/songpart

Delete a song part

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)
- `partId` - the id of the part (required)

Returns

```js
{
  ok: true
}
```

### GET /choir/songparts

Get all parts of a song

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)
- `partNameId` - if supplied, only parts with matching `partNameId`s will be returned

Returns

```js
{
  ok: true,
  parts: [{ ... part doc ... }, { ... part doc ... }]
}
```

## Invitations

### POST /invitation

Parameters:

- `creator` - the id of the user who generated the invitation. (required)
- `invitee` - the email of the person being invited 
- `choirId` - the choir the invitee is being invited to join
- `userId` - the id of the user who needs a password reset

Returns:

```js
{
  ok: true,
  id: "<INVITEID">
}
```

### GET /invitation

Parameters:

- `inviteId` - the id of the invitation

Returns:

```js
{
   ok: true,
   invitation: {
     ... invitation object ...
   }
}
```

Error responses

- `404` - invitation not found
- `498` - invitation exipred

### GET /invitation/list

Parameters: none

Returns:

```js
{
   ok: true,
   invitations: [{..}, {..}]
}
```

### DELETE /invitation

Parameters: 

- `inviteId` - the id of the invitation

Returns:

```js
{
   ok: true
}
```

Error responses

- `400` - missing mandatory parameter
- `404` - invitation not found

## Render

### POST /render

Parameters:

- `choirId` - the id of choir whose song is being rendered (required)
- `songId` - the id of the song being rendered (required) 
- `status` - one of `new`/`converted`/`aligned`/`rendered` (default `new`)

Returns:

```js
{
  ok: true
}
```

### GET /render

Parameters:

- `choirId` - the id of the choir whose song is being rendered (required)
- `songId` - the id of the song being rendered (required)

Returns:

```js
{
   ok: true,
   render: {
     ... render object ...
   }
}
```