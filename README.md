# Choirless API

The Choirless API allows easy manipulation of data stored in the Choirless music collabortion platform.

This API can be deployed to IBM Cloud Functions (OpenWhisk) or during development, run locally as a Node.js/Express app. Application data is stored in Cloudant/CouchDB databases.

## Configuration

The following environment variables configure how the API accesses the database

- `COUCH_URL` - the URL of the CouchDB/Cloudant service e.g. `http://admin:admin@localhost:5984`.
- `COUCH_USERS_DATABASE` - the name of the users database, storing registered Choirless users.
- `COUCH_CHOIRLESS_DATABASE` - the name of the main choirless database (stores choirs/members/songs/parts).

## Setup

The databases and secondary indexes can be setup by running `setup.sh` on a shell with the appropriate environment variables set.

## Testing

Run the automated test suite with:

```sh
npm run test
```

Tests are configured to run automatically in Travis.

## Running dev server

The API can be run locally with:

```sh
npm run server
```

## Deploying serverless deployment

```sh
echo 'to do'
```

## Using in your own project

To save having to spin up your own API server, you can embed the API functions into your own code. First add this repo to your `package.json`:

```js
  ...
  dependencies: {
    "choirlessapi": "Choirless/choirlessapi"
  }
  ...
```

Then require the module in your own code and use it (they rely on the presence of the environment variables described in the _Configuration_ section):

```js
const choirlessAPI = require('choirlessapi')
const main = async () => {
  try {
    const user = await choirlessAPI.getUser({ userId: 'someid' })
    console.log(user)
  } catch (e) {
    console.log('error', e)
  }
}
main()
```

Every function expects an object with parameters listed in the [API Reference](API.md) and returns a Promise:

- getUser
- postUser
- postUserLogin
- getUserChoirs
- getChoir
- getChoirMembers
- getChoirSong
- getChoirSongs
- postChoir
- postChoirJoin
- postChoirSong
- postChoirSongPart
- getChoirSongPart
- getChoirSongParts

## API Reference

Read the [API Reference](API.md).

## Objects

The following objects are stored:

```
                         +--------------+             +---------------+
                         |              |            /|               |
                         |    choir     +-------------+     song      |
                         |              |            \|               |
                         +------+-------+             +-------+-------+
                                |                             |
                                |                             |
+-------------+       +--------/-\-----------+         +-----/-\------+
|             |       |                      |         |              |
|    user     +-------+     choirmember      |         |  songpart    |
|             |       |                      |         |              |
+-------------+       +----------------------+         +--------------+
```

### Users

```js
{
  _id: "<userid>",
  type: "user",
  userId: "<userid>",
  name: "Glynn Bird",
  email: "bob@aol.com",
  createdOn: "2018-01-26",
  verified: true,
  password: "<sha256(salt + password)>",
  salt: "<some random data>"
}
```

### Choirs

```js
{
  _id: "<choirid>:0",
  type: "choir",
  choirId: "<choirid>",
  name: "IBM Bristol Choir",
  description: "IBM Bristol office choir.",
  createdByUserId: "<userid>",
  createdByName: "Bob",
  createdOn: "2020-05-01",
  choirType: "private"
}
```

choirType:

- `private` - invite only
- `public` - anyone can join

### Choir Members

```js
{
  _id: "<choirid>:member:<userId>",
  type: "choirmember",
  choirId: "<choirid>",
  userId: "<userid>",
  joined: "2020-05-02",
  name: "Glynn Bird",
  memberType: "leader"
}
```

memberType:

- `leader` - can create songs, and reference parts
- `member` - can create renditions of parts

### Songs

```js
{
  _id: "<choirid>:song:<soingid>"
  type: "song",
  name: "The Lorem Ipum Song",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  choirId: "<choirid>",
  songId: "<songid>",
  userId: "<userid>",
  createdOn: "2020-05-01",
  partNames: ["baritone", "tenor", "alto", "soprano"]
}
```

### Song parts

```js
{
  _id: "<choirid>:song:<songid>:part:<partid>"
  type: "songpart",
  choirId: "<choirid>",
  songId: "<songid>",
  partId: "<partid>",
  partName: "alto",
  partType: "rendition",
  createdBy: "<userid>",
  name: "Glynn Bird",
  createdOn: "2020-05-01",
  offset: 0
}
```

partType:

- `backing` - backing track
- `reference` - exemplar rendition of part
- `rendition` - choir members rendition of a reference part
