# Create ECS Service

```sh
# create security group
aws ec2 create-security-group --group-name SECURITY_GROUP --description "ELB security group"

# add ingress rules for http/https
aws ec2 authorize-security-group-ingress --group-name SECURITY_GROUP --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name SECURITY_GROUP --protocol tcp --port 443 --cidr 0.0.0.0/0

# create ELB
# replace `subnets` and `secruity-groups`
# subnets copied from vpc attached to sg
aws elbv2 create-load-balancer --name ELB_NAME --subnets subnet-1 subnet-2 subnet-3 --security-groups SECURITY_GROUP_ID

# create target group
# replace `port` and `vpc-id`
aws elbv2 create-target-group --name TARGET_GROUP --protocol HTTP --port 300 --vpc-id VPC_ID

# update ECS service ato associate with load balancer
# by specifying target group ARN
aws ecs create-service \
  --cluster CLUSTER_NAME \
  --service-name CONTAINER_NAME \
  --task-definition CONTAINER_NAME \
  --load-balancers targetGroupArn=TARGET_GROUP_ARN,containerName=CONTAINER_NAME,containerPort=300 \
  --desired-count=1

# create listener
aws elbv2 create-listener --load-balancer-arn ELB_ARN --protocol HTTP --port 300 --default-actions Type=forward,TargetGroupArn=TARGET_GROUP_ARN
```

# Clean Up

```sh
## clean up
# Set desired count of service to 0
aws ecs update-service --cluster CLUSTER_NAME --service CONTAINER_NAME --desired-count 0
# Delete the service
aws ecs delete-service --cluster CLUSTER_NAME --service CONTAINER_NAME

listener_arn=$(aws elbv2 describe-listeners --load-balancer-arn ELB_ARN --query "Listeners[0].ListenerArn" --output text)
aws elbv2 delete-listener --listener-arn $listener_arn

# delete ELB
aws elbv2 delete-load-balancer --load-balancer-arn ELB_ARN
# delete target group
aws elbv2 delete-target-group --target-group-arn TARGET_GROUP_ARN
# delete security group
aws ec2 delete-security-group --group-name SECURITY_GROUP
```
