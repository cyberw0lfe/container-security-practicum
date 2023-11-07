This was for single containers, not kubernetes

```sh
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com

docker login
docker pull YOUR_DOCKER_USERNAME/YOUR_IMAGE_NAME:TAG

# push to GCR because Google doesn't play nice
docker tag YOUR_DOCKER_USERNAME/YOUR_IMAGE_NAME:TAG gcr.io/YOUR_PROJECT_ID/YOUR_IMAGE_NAME:TAG
docker push gcr.io/YOUR_PROJECT_ID/YOUR_IMAGE_NAME:TAG

# deploy to Cloud Run
gcloud run deploy YOUR_SERVICE_NAME --image gcr.io/YOUR_PROJECT_ID/YOUR_IMAGE_NAME:TAG --region YOUR_REGION --platform managed


## clean up
# delete run service
gcloud run services delete YOUR_SERVICE_NAME --region YOUR_REGION --platform managed
# delete image from GCR
gcloud container images list-tags gcr.io/YOUR_PROJECT_ID/YOUR_IMAGE_NAME
# delete tag
gcloud container images delete gcr.io/YOUR_PROJECT_ID/YOUR_IMAGE_NAME:TAG --force-delete-tags


# optional
gcloud auth revoke --all
docker logout
gcloud services disable run.googleapis.com
```
