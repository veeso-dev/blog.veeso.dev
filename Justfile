# Lists all the available commands
default:
    @just --list

dev:
    gleam run -m blog/dev
