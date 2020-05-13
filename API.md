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

Parameters (all optional):

- `userId` - if omitted a new user is generated.
- `name` - name of user.
- `password` - password.
- `email` - email address of user.
- `verified` - whether the user is verified or not.

Returns:

```js
{
  ok: true
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