if [ ! -d ".near-credentials" ]; then
    mkdir .near-credentials
    cp -R ~/.near-credentials/ .near-credentials/
fi
docker build -t feiyu-connector .
docker run feiyu-connector