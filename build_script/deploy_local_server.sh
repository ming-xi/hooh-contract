#!/bin/bash
cd ../server/ || exit
if [ ! -d ".near-credentials" ]; then
    mkdir .near-credentials
fi
cp -R ~/.near-credentials/ .near-credentials/
yarn start

