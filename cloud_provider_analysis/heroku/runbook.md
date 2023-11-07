# NOT USED

Heroku support container deployments but does not provide a managed Kubernetes service, so it was dropped from analysis throughout the course of this project as I switched from individual containers to clusters.

# Create a Heroku config file

```yml
build:
  docker:
    web: Dockerfile
```

# Push and release the image

```sh
heroku login
heroku container:login

# tag image
docker tag DOCKERNAME/benchsec registry.heroku.com/benchsec/web

# push image
docker push registry.heroku.com/benchsec/web

# release image
heroku container:release web --app APPNAME

# open app
heroku open --app APPNAME
```

# Shut Down

```sh
heroku apps
heroku ps:scale worker=0 --app APPNAME
```
