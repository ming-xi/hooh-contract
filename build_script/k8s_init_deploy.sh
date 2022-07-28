#!/bin/bash
cd ../build_config || exit
kubectl apply -f eks-connector.yaml
echo '::connector'
kubectl get all -n hooh-connector
kubectl get pods -n hooh-connector -o wide
kubectl get ingress -n hooh-connector --output=wide