#!/bin/sh
# wait-for-mysql.sh

set -e

host="$1"
shift
cmd="$@"

# Usar el mismo usuario y contraseña configurados en docker-compose.yml
until mysqladmin ping -h "$host" -u root -ppassword --silent; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 2
done

>&2 echo "MySQL is up - executing command"
exec $cmd 