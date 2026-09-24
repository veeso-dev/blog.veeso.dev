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

# Add reading times to articles
add_reading_time:
    python3 scripts/add_reading_time.py
    just fmt
