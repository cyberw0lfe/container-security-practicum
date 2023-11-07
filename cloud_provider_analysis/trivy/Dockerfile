# Update databases before runtime
FROM aquasec/trivy:latest as trivy-db

ENV TRIVY_CACHE_DIR /trivy-db-cache

RUN trivy image --download-db-only

# Build image and copy db
FROM aquasec/trivy:latest

COPY --from=trivy-db /trivy-db-cache /root/.cache/trivy/db

WORKDIR /root

ENTRYPOINT ["trivy"]

CMD ["k8s", "--report", "summary", "cluster"]
