# Setup

These instructions are for deploying a private image hosted in the Docker Registry to the azure container service

```sh
az login

# set subscription
az account set --subscription SUBSCRIPTION_ID

# create resource group
az group create --name RESOURCE_GROUP --location PREFERRED_LOCATION

# run in ACI
az container create \
    --resource-group RESOURCE_GROUP \
    --name CONTAINER_NAME \
    --image DOCKER_USERNAME/IMAGE_NAME:TAG \
    --registry-login-server docker.io \
    --registry-username DOCKER_USERNAME \
    --registry-password DOCKER_PASSWORD \
    --dns-name-label DNS_LABEL \
    --ports PORT

# access service
az container show --resource-group RESOURCE_GROUP --name CONTAINER_NAME --query "{IP:ipAddress.ip, FQDN:ipAddress.fqdn}" --out table
```

# Cleanup

```sh
az container delete --resource-group RESOURCE_GROUP --name CONTAINER_NAME
az group delete --name RESOURCE_GROUP
```
