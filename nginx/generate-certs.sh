#!/bin/bash
# Generate self-signed TLS certificate for development/internal use
# Run this script once before starting the application with Docker Compose
#
# Usage:
#   bash nginx/generate-certs.sh
#
# The certificates will be placed in the nginx-certs Docker volume.
# For production, replace with certificates from a trusted CA.

set -e

CERT_DIR="./certs"
DAYS=365
CN="projecthub.internal"

mkdir -p "$CERT_DIR"

echo "Generating self-signed certificate for CN=$CN (valid for $DAYS days)..."

openssl req -x509 -nodes -days "$DAYS" \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "/CN=$CN"

echo ""
echo "Certificate generated:"
echo "  Key : $CERT_DIR/server.key"
echo "  Cert: $CERT_DIR/server.crt"
echo ""
echo "Copy these files to the nginx-certs Docker volume:"
echo "  docker run --rm -v projecthub_nginx-certs:/certs -v \$(pwd)/certs:/src alpine cp /src/server.key /src/server.crt /certs/"
echo ""
echo "Then distribute server.crt to client browsers as a trusted certificate."
