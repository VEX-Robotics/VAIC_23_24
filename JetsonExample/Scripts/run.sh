#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(dirname "$0")"

# Navigate to the desired directory
cd "$SCRIPT_DIR/../../JetsonWebDashboard/vexai-web-dashboard-react"

# Serve the build directory in the background
serve -s build &

# Get the directory of the Python program (one level above the script)
PYTHON_DIR="$(realpath "$SCRIPT_DIR/..")"
PYTHON_PROGRAM="$PYTHON_DIR/overunder.py"

# Set the required environment variables
export PATH=/usr/local/cuda/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
export PYTHONPATH=$PYTHONPATH:/usr/local/OFF

# Run the Python program
/usr/bin/python3 $PYTHON_PROGRAM
