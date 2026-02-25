# Lists all the available commands
default:
    @just --list

dev:
    gleam run
    docker compose up --build
