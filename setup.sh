#!/bin/bash

CTYPE="Content-Type: application/json"

# create users database (non-partitioned)
curl -X PUT "${COUCH_URL}/${COUCH_USERS_DATABASE}"

# create index on email address
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["email"]},"name":"byEmail"}' "${COUCH_URL}/${COUCH_USERS_DATABASE}/_index"

# create choirless database (partitioned)
curl -X PUT "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}?partitioned=true"

# create choirless keys database (unpartitioned)
curl -X PUT "${COUCH_URL}/${COUCH_KEYS_DATABASE}"

# create a secondary indexes
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["type"]},"name":"byType","partitioned":true}' "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}/_index"
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["userId","type"]},"name":"byUserIdType","partitioned":false}' "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}/_index"

# create queue database (unpartitioned)
curl -X PUT "${COUCH_URL}/${COUCH_QUEUE_DATABASE}"
# create a secondary indexes
# curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["type","status"]},"name":"byStatus"}' "${COUCH_URL}/${COUCH_QUEUE_DATABASE}/_index"

# create invitation database
curl -X PUT "${COUCH_URL}/${COUCH_INVITATION_DATABASE}"