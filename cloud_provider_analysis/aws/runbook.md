# Container Registry

```sh
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com

# create image repo
aws ecr create-repository --repository-name IMAGE_ONE
aws ecr create-repository --repository-name IMAGE_TWO

# tag images
docker tag IMAGE_ONE:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/IMAGE_ONE:latest
docker tag IMAGE_TWO:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/IMAGE_TWO:latest

# push to ECR
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/IMAGE_ONE:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/IMAGE_TWO:latest

```

# EKS Cluster

```sh
# create cluster
eksctl create cluster --name CLUSTER_NAME --region REGION --nodegroup-name NODE_GROUP --node-type t3.medium --nodes 3
```

## Create Config Files

k8s-deployment.yml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-deployment
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: first-container
          image: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/IMAGE_ONE:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
        - name: second-container
          image: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/IMAGE_TWO:latest
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
```

k8s-service.yml

```yml
apiVersion: v1
kind: Service
metadata:
  name: some-http-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

## Push Config

```sh
kubectl apply -f deployment.yml
kubectl apply -f service.yml
```

# Tear Down

```sh
# delete cluster
eksctl delete cluster --name CLUSTER_NAME --region REGION

# delete images from ECR
aws ecr batch-delete-image --repository-name IMAGE_ONE --image-ids imageTag=latest
aws ecr batch-delete-image --repository-name IMAGE_TWO --image-ids imageTag=latest

```
