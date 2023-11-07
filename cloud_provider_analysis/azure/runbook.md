# Create Container Registry and Push Images

```sh
# create resource group
az group create --name RESOURCE_GROUP_NAME --location eastus

# create container registry (ACR)
az acr create --resource-group RESOURCE_GROUP_NAME --name REGISTRY_NAME --sku Basic

# auth ACR
az acr login --name REGISTRY_NAME

# tag images
docker tag DOCKERNAME/basic-node:latest REGISTRY_NAME.azurecr.io/basic-node:latest
docker tag DOCKERNAME/trivy-scan:summary REGISTRY_NAME.azurecr.io/trivy-summary:latest

# push to ACR
docker push REGISTRY_NAME.azurecr.io/basic-node:latest
docker push REGISTRY_NAME.azurecr.io/trivy-summary:latest
```

# Create Cluster

```sh
az aks create \
  --resource-group RESOURCE_GROUP_NAME \
  --name benchsecAKSCluster \
  --node-count 1 \
  --enable-addons monitoring \
  --generate-ssh-keys

# connect to AKS cluster
az aks install-cli
az aks get-credentials --resource-group RESOURCE_GROUP_NAME --name benchsecAKSCluster
```

# Deploy Cluster

Create a file `k8s-deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kube-app
  template:
    metadata:
      labels:
        app: kube-app
    spec:
      serviceAccountName: trivy-sa
      containers:
        - name: basic-node
          image: <acr-name>.azurecr.io/basic-node:latest
          resources:
            requests:
              memory: '384Mi'
              cpu: '100m'
          ports:
            - containerPort: 80
        - name: trivy-summary
          image: <acr-name>.azurecr.io/trivy-summary:latest
          resources:
            requests:
              memory: '768Mi'
              cpu: '500m'
```

Apply the file

```sh
kubectl apply -f k8s-deployment.yml
```

## Expose HTTP container

Only necessary if testing access to the node container.
`kubectl expose deployment kube-deployment --type=LoadBalancer --name=node-service --port=80 --target-port=80`

# Cleanup

```sh
# delete AKS cluster
az aks delete --name kube-deployment --resource-group RESOURCE_GROUP_NAME --yes --no-wait
az acr delete --name REGISTRY_NAME
```
