### Run Docker Container

docker run -d -ti --restart=always -v /var/docker/qManager/template:/var/node/win-print-mgmt/template -v /var/docker/qManager/cert:/var/node/win-print-mgmt/cert --name win-print-mgmt --env-file /var/docker/qManager/.env -p 3003:80 docker.io/lspiehler/win-print-mgmt:c3f28eb