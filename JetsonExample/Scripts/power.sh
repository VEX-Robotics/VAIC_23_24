#!/bin/bash

# Path to the new file
new_file_path="./nvpmodel_t210_jetson-nano.conf"

# Check if the new file exists
if [ ! -f "$new_file_path" ]; then
  echo "New file does not exist. Exiting."
  exit 1
fi

# Backup the existing file
sudo cp /etc/nvpmodel/nvpmodel_t210_jetson-nano.conf /etc/nvpmodel/nvpmodel_t210_jetson-nano.conf.bak

# Replace the existing file with the new one
sudo cp "$new_file_path" /etc/nvpmodel/nvpmodel_t210_jetson-nano.conf

# Set the correct permissions and ownership
sudo chmod 644 /etc/nvpmodel/nvpmodel_t210_jetson-nano.conf
sudo chown root:root /etc/nvpmodel/nvpmodel_t210_jetson-nano.conf

echo "File replaced successfully!"
