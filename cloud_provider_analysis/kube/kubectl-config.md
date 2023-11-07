# Update and Verify Kube Config

## Point Kube at the correct cluster

```sh
# AWS
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl
aws eks --region us-east-1 update-kubeconfig --name benchsec-eks

# Azure
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

# IBM
ibmcloud login -a cloud.ibm.com -r <region> -g <resource_group>
ibmcloud plugin install container-service -r Bluemix
ibmcloud ks cluster config --cluster <cluster_name_or_ID>

# Digital Ocean
doctl auth init
doctl kubernetes cluster kubeconfig save <cluster_name_or_ID>

# Google Cloud
gcloud container clusters get-credentials <cluster_name> --zone <zone> --project <project_id>
```

## Verify Config

```sh
# verify config
kubectl get nodes
kubectl get svc

# check context
kubectl config current-context

# switch context if needed
kubectl config get-contexts
kubectl config use-context your-eks-cluster-context

```
