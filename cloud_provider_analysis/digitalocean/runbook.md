# Setup and push images

```sh
doctl auth init

# create DO container reg
doctl registry create REGISTRY

# auth container reg
doctl registry login

# tag iamges
docker tag basic-node:latest registry.digitalocean.com/REGISTRY/basic-node:latest
docker tag trivy-scan:latest registry.digitalocean.com/REGISTRY/trivy-scan:latest

# push iamges
docker push registry.digitalocean.com/REGISTRY/basic-node:latest
docker push registry.digitalocean.com/REGISTRY/trivy-scan:latest
```

# create a DOKS cluster

```sh
doctl kubernetes cluster create DOKS_CLUSTER --region nyc1 --count 1 --size s-1vcpu-2gb

# configure kubectl for DOKS
`doctl kubernetes cluster kubeconfig save DOKS_CLUSTER`
```

# create kube deployment

create k8s-deployment.yml

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
          image: registry.digitalocean.com/REGISTRY/basic-node:latest
          resources:
            requests:
              memory: '280Mi'
              cpu: '150m'
          ports:
            - containerPort: 80
        - name: trivy-scan
          image: registry.digitalocean.com/REGISTRY/trivy-scan:latest
          resources:
            requests:
              memory: '280Mi'
              cpu: '150m'
```

```sh
# apply
kubectl apply -f k8s-deployment.yaml

# expose container if needed
kubectl expose deployment my-deployment --type=LoadBalancer --name=my-service --port=80 --target-port=80
```

# teardown

```sh
# delete Kube cluster
doctl kubernetes cluster delete your-cluster-id

# delete container reg
doctl registry gc
doctl registry delete --force
```
