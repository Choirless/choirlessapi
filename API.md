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
