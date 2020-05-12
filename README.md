# Choirless API

The Choirless API allows easy manipulation of data stored in the Choirless music collabortion platform.

This API can be deployed to IBM Cloud Functions (OpenWhisk) or during development, run locally as a Node.js/Express app. Application data is stored in Cloudant/CouchDB databases.

## Configuration

The following environment variables configure how the API accesses the database

- `COUCH_URL` - the URL of the CouchDB/Cloudant service e.g. `http://admin:admin@localhost:5984`
- `COUCH_USERS_DATABASE` - the name of the users database

## Setup

The databases and secondary indexes can be setup by running `setup.sh` on a shell with the appropriate environment variables set.

## Running dev server

The API can be run locally with:

```sh
npm run server
```

## Deploying serverless deployment

```sh
echo 'to do'
```

## API Reference

Read the [API.md](API Reference).

## Objects

The following objects are stored:

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

Secondary Indexes

- `email` - log in 
- `createdOn` - sign ups by day

### Choir

```js
{
  _id: "<choirid>",
  type: "choir",
  choirId: "<choirid>",
  name: "IBM Bristol Choir",
  description: "IBM Bristol office choir.",
  createdBy: "<userid>",
  createdOn: "2020-05-01",
  choirType: "private"
}
```

choirType:

- `private` - invite only
- `public` - anyone can join

Secondary Indexes

- `createdBy` - to allow a user to list the choirs they own

### Choir Members

```js
{
  _id: "<choirid>:member<userId>",
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

Secondary Indexes

- `userid` - to get a list of choirs a user is a member of


### Songs

```js
{
  _id: "<choirid>:song<soingid>"
  type: "song",
  description: "The Lorem Ipsum Song",
  choirId: "<choirid>",
  songId: "<songid>",
  createdBy: "<userid>",
  createdOn: "2020-05-01",
  printedAssets: [
    { "name": "score", path: "<som cos key"},
    { "name": "lyrics", path: "<som cos key"}],
  partNames: ["baritone", "tenor", "alto", "soprano"]
}
```

Secondary Indexes

-

### Song parts

```js
{
  _id: "<choirid>:song<songid>:part<partid>"
  type: "songpart",
  choirId: "<choirid>",
  songId: "<songid>",
  partId: "<partid>",
  partName: "alto",
  partType: "rendition",
  renditionOf: "<partid>",
  createdBy: "<userid>",
  name: "Glynn Bird",
  createdOn: "2020-05-01"
}
```

partType

- `backing` - backing track
- `reference` - exemplar rendition of part
- `rendition` - choir members rendition of a reference part

Secondary Indexes

-