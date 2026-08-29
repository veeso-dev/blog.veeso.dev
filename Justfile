# Lists all the available commands
default:
    @just --list

dev:
    gleam run -m blog/dev

# Format all sources with dprint
fmt args="":
    dprint fmt {{ args }}

# Check formatting of all sources with dprint
fmt_check args="":
    dprint check {{ args }}
