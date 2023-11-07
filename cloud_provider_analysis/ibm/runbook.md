# Setup and publish images

```sh
# update container service plugin
ibmcloud plugin install container-service -r Bluemix
ibmcloud plugin update

# upload docker images to IBM container reg (ICR)
ibmcloud cr namespace-add REGISTRY

# tag docker images
docker tag basic-node:latest us.icr.io/REGISTRY/basic-node:latest
docker tag trivy-scan:latest us.icr.io/REGISTRY/trivy-scan:latest

# log daemon into ICR
ibmcloud cr login

# push images
docker push us.icr.io/REGISTRY/basic-node:latest
docker push us.icr.io/REGISTRY/trivy-scan:latest
```

# create a kube cluster

```sh
ibmcloud ks cluster create classic --name CLUSTER --zone ZONE --machine-type u4c.8x16

# set context to use cluster in kubectl
ibmcloud ks cluster config --cluster CLUSTER
```

# deploy to kube

create k8s-deployment.yml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gke-deployment
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
      imagePullSecrets:
        - name: my-registry-secret
      containers:
        - name: node-container
          image: us.icr.io/benchsec-reg/basic-node:latest
          resources:
            limits:
              memory: '300Mi'
              cpu: '100m'
          ports:
            - containerPort: 80
        - name: daemon-container
          image: us.icr.io/benchsec-reg/trivy-summary:latest
          resources:
            limits:
              memory: '300Mi'
              cpu: '300m'
```

```sh
kubectl apply -f k8s-deployment.yml

# expose http container
kubectl expose deployment my-deployment --type=LoadBalancer --name=my-service --port=80 --target-port=80

# retrieve IP
kubectl get svc my-service
```

# teardown

```sh
## delete kube cluster
ibmcloud ks cluster rm --cluster your-cluster-id

## delete images from reg
ibmcloud cr image-list
ibmcloud cr image-rm image-url
```
