# login to ECR
replace your-region
`$(aws ecr get-login --no-include-email --region your-region)`

# create repos
replace names
`aws ecr create-repository --repository-name my-http-image`
`aws ecr create-repository --repository-name my-daemon-image`

# tag the images
replace account-id and your-region
`docker tag my-http-image:latest account-id.dkr.ecr.your-region.amazonaws.com/my-http-image:latest`
`docker tag my-daemon-image:latest account-id.dkr.ecr.your-region.amazonaws.com/my-daemon-image:latest`

# push to ECR
`docker push account-id.dkr.ecr.your-region.amazonaws.com/my-http-image:latest`
`docker push account-id.dkr.ecr.your-region.amazonaws.com/my-daemon-image:latest`

# define ECS Task Definition
ecs-task-definition.json

```json
{
  "family": "my-task-family",
  "containerDefinitions": [
    {
      "name": "http-container",
      "image": "account-id.dkr.ecr.your-region.amazonaws.com/my-http-image:latest",
      "memory": 512,
      "cpu": 128,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80
        }
      ]
    },
    {
      "name": "daemon-container",
      "image": "account-id.dkr.ecr.your-region.amazonaws.com/my-daemon-image:latest",
      "memory": 512,
      "cpu": 128,
      "essential": true,
      "mountPoints": [
        {
          "sourceVolume": "docker-socket",
          "containerPath": "/var/run/docker.sock"
        }
      ]
    }
  ],
  "volumes": [
    {
      "name": "docker-socket",
      "host": {
        "sourcePath": "/var/run/docker.sock"
      }
    }
  ]
}
```

# register task definition
`aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json`

# create ECS cluster
`aws ecs create-cluster --cluster-name my-cluster`

# launch ECS service
`aws ecs create-service --cluster my-cluster --service-name my-service --task-definition my-task-family --desired-count 1 --launch-type EC2`

# security
For the container accepting HTTP/HTTPS requests, make sure the EC2 instances' security groups allow these requests. For the container that needs access to the Docker daemon, ensure you understand the security implications, as it has significant power.

# scaling / load balancing
If you want to add load balancing or scale the number of tasks, you'll need to dive deeper into ECS services, task placements, and AWS Load Balancer settings.

# teardown
## delete ECS service
`aws ecs update-service --cluster your-cluster-name --service your-service-name --desired-count 0`
`aws ecs delete-service --cluster your-cluster-name --service your-service-name`

## delete ECS cluster
`aws ecs delete-cluster --cluster your-cluster-name`

## deregister task definitions
`aws ecs deregister-task-definition --task-definition task-definition-name:version`

## remove ECR images
`1aws ecr list-images --repository-name your-repo-name`

## delete images
`aws ecr batch-delete-image --repository-name your-repo-name --image-ids imageTag=your-image-tag`
