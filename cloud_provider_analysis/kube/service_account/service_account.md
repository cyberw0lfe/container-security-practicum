The service account was originally created when I was trying to run a Trivy image on the Kubernetes cluster. This would give the image admin level privileges in order to access all the necessary config to run the configuration scans.

(TODO: VERIFY CLAIM) This wasn't necessary for running the `kube-bench` job though.

```sh
kubectl apply -f service-account.yml
kubectl apply -f sa-role-binding.yml
```
