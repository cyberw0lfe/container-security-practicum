# Setup and push containers

```sh
# set up projects and ensure billing is enabled
gcloud auth login
gcloud config set project PROJECTID

# enabled GKE and GCR
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com

# tag images
docker tag basic-node:latest gcr.io/PROJECTID/basic-node:latest
docker tag trivy-scan:latest gcr.io/PROJECTID/trivy-scan:latest

# setup Docker to use gcloud cred helper
gcloud auth configure-docker

# upload images to GCR
docker push gcr.io/PROJECTID/basic-node:latest
docker push gcr.io/PROJECTID/trivy-scan:latest
```

# create GKE cluser

```sh
gcloud container clusters create CLUSTER_NAME --zone ZONE --machine-type e2-small

# get `kubectl` credentials for cluster
gcloud container clusters get-credentials CLUSTER_NAME --zone ZONE
```

# deploy conatiners to GKE

create gke-deployment.yml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: basic-node
          image: gcr.io/PROJECTID/basic-node:latest
          resources:
            requests:
              memory: '280Mi'
              cpu: '150m'
          ports:
            - containerPort: 80
        - name: trivy-scan
          image: gcr.io/PROJECTID/trivy-scan:latest
          resources:
            requests:
              memory: '280Mi'
              cpu: '150m'
```

```sh
# apply deployment
kubectl apply -f gke-deployment.yaml

# expose http container
kubectl expose deployment my-deployment --type=LoadBalancer --name=http-container --port=80 --target-port=80

# get IP address
kubectl get svc my-service
```

# teardown

```sh
# delete GKE cluster
gcloud container clusters delete your-cluster-name --zone your-zone-name

# delete images from GCR
gcloud container images list-tags gcr.io/PROJECTID/your-image-name
gcloud container images delete gcr.io/PROJECTID/your-image-name:tag
```
