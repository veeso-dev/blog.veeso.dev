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
  # update browserslist db
  yes | npx update-browserslist-db@latest
  info "starting blog"
  screen -S blog -d -m yarn serve
  sleep 1
  PID=$(ps aux | grep "SCREEN -S blog" | head -n 1 | awk '{print $2}')
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

reload() {
  info "reloading blog"
  git stash
  sudo monit stop blog 
  git pull origin main 
  sudo yarn 
  sudo yarn build
  sudo monit start blog
}

NODE=$(which node)
if [ -z "$NODE" ]; then
  export NVM_DIR="/root/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
  nvm use 22
fi

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

  "reload")
    reload
    ;;
  
  *)
    "unknown operation $OP"
    exit 1
    ;;

esac
