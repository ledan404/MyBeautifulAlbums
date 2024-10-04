#!/usr/bin/env fish

# Load .env file
if test -f .env
    # Read the .env file line by line
    for line in (cat .env)
        # Skip lines that are empty or start with a comment (#)
        if string match -r '^\s*(#|$)' -- $line
            continue
        end

        # Split the line into key and value
        set key_value (string split "=" $line)

        # Set environment variable
        set -x $key_value[1] $key_value[2]
    end
else
    echo ".env file not found."
end
