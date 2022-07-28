#!/bin/bash
cd ../server/ || exit
if ! docker build -f ../build_config/Dockerfile --build-arg ENV_FILE=.env_staging -t hooh-contract-connector:test .; then
    echo "docker image build error"
    exit
fi

docker stop connector
docker rm connector
docker run --name connector -p 3100:3100 -d hooh-contract-connector:test