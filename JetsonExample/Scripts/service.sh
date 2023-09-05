#!/bin/bash

# Detect the first non-root user
DEFAULT_USER=$(getent passwd {1000..60000} | awk -F: '{ print $1}' | head -n 1)

# Get the directory of the current script
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

# Path to the run.sh script
RUN_PROGRAM_SCRIPT="$SCRIPT_DIR/run.sh"

# Path to the system's systemd directory
SYSTEMD_DIR="/etc/systemd/system"
SERVICE_FILE="$SYSTEMD_DIR/vexai.service"

# Print the paths for debugging
echo "Systemd directory: $SYSTEMD_DIR"
echo "Service file: $SERVICE_FILE"
echo "Path to run.sh: $RUN_PROGRAM_SCRIPT"
echo "Running as user: $DEFAULT_USER"

# Write the service file content
echo "[Unit]" > "$SERVICE_FILE"
echo "Description=Start the VEXAI root program" >> "$SERVICE_FILE"
echo "[Service]" >> "$SERVICE_FILE"
echo "User=$DEFAULT_USER" >> "$SERVICE_FILE"
echo "ExecStart=/bin/bash $RUN_PROGRAM_SCRIPT" >> "$SERVICE_FILE"
echo "Restart=always" >> "$SERVICE_FILE"
echo "[Install]" >> "$SERVICE_FILE"
echo "WantedBy=multi-user.target" >> "$SERVICE_FILE"

# Print the content of the service file for verification
echo "Content of the service file:"
cat "$SERVICE_FILE"

# Reload the system-level systemd configuration
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable vexai
sudo systemctl start vexai

echo "Service installed and started successfully!"
