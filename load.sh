#!/bin/sh

BASEDIR=.
NODEOPTS="--max-old-space-size=4096"

node ${NODEOPTS} ${BASEDIR}/tools/delete_database.js

node ${NODEOPTS} ${BASEDIR}/tools/create_database.js && \
node ${NODEOPTS} ${BASEDIR}/tools/populate_parts.js && \
node ${NODEOPTS} ${BASEDIR}/tools/populate_boms_interchanges.js && \
node ${NODEOPTS} ${BASEDIR}/tools/populate_alt_boms.js
