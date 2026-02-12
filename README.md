### Build Docker Container

docker build -t ghcr.io/lspiehler/win-print-mgmt:3fc1b72 .

### Run Docker Container

docker run --rm -ti -v /var/node/win-print-mgmt/template:/var/node/win-print-mgmt/template -v /var/node/win-print-mgmt/cert:/var/node/win-print-mgmt/cert --name win-print-mgmt --env-file /var/node/win-print-mgmt/.env -p 3033:3033 -p 3034:3034 ghcr.io/lspiehler/win-print-mgmt:3fc1b72