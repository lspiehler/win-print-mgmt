### Run Docker Container

docker run -d -ti --restart on-failure -v /var/docker/qManager/certs:/var/node/win-print-mgmt/certs --name win-print-mgmt --env-file /var/docker/qManager/.env -p 3003:80 docker.io/lspiehler/win-print-mgmt:324dbb2