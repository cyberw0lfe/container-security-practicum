This was for Docker, unused.

```sh
doctl auth init

# create droplet
doctl compute droplet create DROPLET_NAME --image ubuntu-20-04-x64 --region nyc3 --size s-1vcpu-1gb --ssh-keys YOUR_SSH_KEY_ID

# ssh into droplet
doctl compute droplet list
ssh root@DROPLET_IP_ADDRESS


# install docker on droplet
sudo apt update
sudo apt install docker.io
sudo systemctl enable docker

# login
docker login

# pull and run
docker pull YOUR_DOCKER_USERNAME/YOUR_IMAGE_NAME:TAG
docker run [OPTIONS] YOUR_DOCKER_USERNAME/YOUR_IMAGE_NAME:TAG


## clean up
ssh root@DROPLET_IP_ADDRESS
docker ps
docker stop CONTAINER_ID
docker rm CONTAINER_ID
# remove image from droplet
docker rmi YOUR_DOCKER_USERNAME/YOUR_IMAGE_NAME:TAG

## optional
docker logout
sudo apt purge docker.io
sudo apt autoremove
exit

# delete droplet
doctl compute droplet list
doctl compute droplet delete DROPLET_ID
```
