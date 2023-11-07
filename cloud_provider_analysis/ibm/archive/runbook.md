This was for a single container not kubes.

```sh
ibmcloud plugin install code-engine
ibmcloud login
ibmcloud cr login

# namespace registry
ibmcloud cr namespace-add YOUR_NAMESPACE

docker login
docker pull YOUR_DOCKER_USERNAME/YOUR_IMAGE_NAME:TAG

# tag for ICR
docker tag YOUR_DOCKER_USERNAME/YOUR_IMAGE_NAME:TAG us.icr.io/YOUR_NAMESPACE/YOUR_IMAGE_NAME:TAG
# push to ICR
docker push us.icr.io/YOUR_NAMESPACE/YOUR_IMAGE_NAME:TAG


# create Code Engine project and set context
ibmcloud ce project create --name YOUR_PROJECT_NAME
ibmcloud ce project select -n YOUR_PROJECT_NAME

# deploy container
ibmcloud ce application create --name YOUR_APP_NAME --image us.icr.io/YOUR_NAMESPACE/YOUR_IMAGE_NAME:TAG

# access service
ibmcloud ce application get --name YOUR_APP_NAME


## clean up
# delete code engine application
ibmcloud ce application delete --name YOUR_APP_NAME

# delete code engine project
ibmcloud ce project delete --name YOUR_PROJECT_NAME

# delete image from IBM registry
ibmcloud cr image-rm us.icr.io/YOUR_NAMESPACE/YOUR_IMAGE_NAME:TAG

# delete namespace
ibmcloud cr namespace-rm YOUR_NAMESPACE

## optional
docker logout
ibmcloud logout
```
