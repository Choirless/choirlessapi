#!/bin/bash

CTYPE="Content-Type: application/json"

# create users database
curl -X PUT "${COUCH_URL}/${COUCH_USERS_DATABASE}"

# create index on email address
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["email"]},"name":"byEmail"}' "${COUCH_URL}/${COUCH_USERS_DATABASE}/_index"

# create choirless database
curl -X PUT "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}"

# create a secondary indexes
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["type","i1"]},"name":"i1"}' "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}/_index"
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["type","i2"]},"name":"i2"}' "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}/_index"
