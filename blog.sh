#!/bin/sh

cd "$(dirname "$0")" || exit 1

PIDFILE="/var/run/blog.veeso.dev.pid"

info() {
    printf '%s\n' "${BOLD}${GREY}>${NO_COLOR} $*"
}

warn() {
    printf '%s\n' "${YELLOW}! $*${NO_COLOR}"
}

error() {
    printf '%s\n' "${RED}x $*${NO_COLOR}" >&2
}

completed() {
    printf '%s\n' "${GREEN}✓${NO_COLOR} $*"
}

start() {
  yarn && yarn build
  info "starting blog"
  yarn serve &
  PID="$!"
  echo "$PID" > $PIDFILE
  info "blog started with PID $PID"

  return 0
}

stop() {
  info "stopping blog"
  PID=$(cat $PIDFILE)
  if [ -z "$PID" ]; then
    error "Could not find any PID for blog"
    return 1
  fi
  info "killing PID $PID"
  kill $PID

  return 0
}

case "$1" in

  "start")
    start
    ;;
  
  "stop")
    stop
    ;;

  "restart")
    stop
    start
    ;;
  
  *)
    "unknown operation $OP"
    exit 1
    ;;

esac
