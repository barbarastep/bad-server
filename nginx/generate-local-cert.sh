#!/bin/sh

set -eu

CERT_DIR="$(CDPATH= cd -- "$(dirname "$0")/certs" && pwd)"

openssl req \
    -x509 \
    -nodes \
    -days 365 \
    -newkey rsa:2048 \
    -keyout "$CERT_DIR/localhost.key" \
    -out "$CERT_DIR/localhost.crt" \
    -config "$CERT_DIR/localhost.cnf"
