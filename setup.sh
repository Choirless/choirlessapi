#!/bin/bash

CTYPE="Content-Type: application/json"

# create users database
curl -X PUT "${COUCH_URL}/${COUCH_USERS_DATABASE}"

# create index on email address
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["email"]},"name":"byEmail"}' "${COUCH_URL}/${COUCH_USERS_DATABASE}/_index"