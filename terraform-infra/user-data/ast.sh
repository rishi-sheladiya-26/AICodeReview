#!/bin/bash

set -e

apt update -y
apt install -y git curl

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

npm install -g pm2

cd /home/ubuntu

git clone https://github.com/PriyanshuValiya/RepoPilot-ast.git
cd RepoPilot-ast

npm install

export HOME=/home/ubuntu
sudo -u ubuntu pm2 start ast.js --name RepoPilot-ast

sudo -u ubuntu pm2 save

sudo -u ubuntu pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash

systemctl enable pm2-ubuntu
systemctl start pm2-ubuntu