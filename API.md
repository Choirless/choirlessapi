# Choirless API

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

Returns:

```js
{
  ok: true,
  userId: '<id of user>'
}
```

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
- `partNames` - an array of parts e.g. `['alto','tenor','soprano']`

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


### POST /choir/songpart

Insert/update a song part

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the song (required)
- `partId` - the id of the part (required for updates, if omitted a new song part is created)
- `partName` - name of the part e.g. drums, alto
- `partType` - one of `backing`/`reference`/`rendition`
- `userId` - the id of the user (required for new parts)
- `userName` - the name of the user (required for new parts)
- `offset` - the number of milliseconds after the reference part that this recording started (default 0)

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
- `songId` - the id of the choir (required)
- `partId` - the id of the part (required)

Returns

```js
{
  ok: true,
  part: { ... part doc ... }'
}
```


### GET /choir/songparts

Get all parts of a song

Parameters:

- `choirId` - the id of the choir (required)
- `songId` - the id of the choir (required)

Returns

```js
{
  ok: true,
  parts: [{ ... part doc ... }, { ... part doc ... }]
}
```