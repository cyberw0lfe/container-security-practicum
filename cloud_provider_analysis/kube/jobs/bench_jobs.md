Commands to run the bench job against the cluster, grab the pod name, and then output the logs. Jobs require unique names so that needs to be updated if run multiple times.

```sh
kubectl apply -f general_bench_job.yml
kubectl get pods
kubectl logs <pod-name>
```

All platform benchmarks can be [found here](https://github.com/aquasecurity/kube-bench/blob/main/docs/platforms.md)
