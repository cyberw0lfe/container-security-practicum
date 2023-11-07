The Trivy image is from the same organization as `kube-bench` and has it pre-installed. I tried to include a version of this image with my Kubernetes deployment but I was having trouble getting it to run in a reasonable amount of time. It attempts to download the newest vulnerability databases which was taking a long time, so I attempted to pre-load the local DB in the build step but this didn't work. I also tried to skip this step as it wouldn't impact the CIS benchmark tests, however it is required to run on startup the first time. I eventually gave up and found the job approach using `kube-bench`.

```sh
docker build . -t <img-name> --platform linux/amd64
```
