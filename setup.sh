#!/bin/bash

CTYPE="Content-Type: application/json"

# create users database (non-partitioned)
curl -X PUT "${COUCH_URL}/${COUCH_USERS_DATABASE}"

# create index on email address
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["email"]},"name":"byEmail"}' "${COUCH_URL}/${COUCH_USERS_DATABASE}/_index"

# create choirless database (partitioned)
curl -X PUT "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}?partitioned=true"
# create a secondary indexes
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["type"]},"name":"byType","partitioned":true}' "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}/_index"
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["userId","type"]},"name":"byUserIdType","partitioned":false}' "${COUCH_URL}/${COUCH_CHOIRLESS_DATABASE}/_index"

# create choirless keys database (unpartitioned)
curl -X PUT "${COUCH_URL}/${COUCH_KEYS_DATABASE}"

# create invitation database
curl -X PUT "${COUCH_URL}/${COUCH_INVITATION_DATABASE}"
curl -X POST -H "${CTYPE}" -d'{"index":{"fields": ["expires"]},"name":"byExpiration","partitioned":false}' "${COUCH_URL}/${COUCH_INVITATION_DATABASE}/_index"

# create render database (unpartitioned)
curl -X PUT "${COUCH_URL}/${COUCH_RENDER_DATABASE}"
curl -X POST -H "${CTYPE}" -d'{"ddoc":"find","index":{"partial_filter_selector":{"status":"done"},"fields": ["choirId","songId","partId"]},"name":"completedRenders","partitioned":false}' "${COUCH_URL}/${COUCH_INVITATION_DATABASE}/_index"
