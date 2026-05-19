# Infrastructure

Deployment and infra-as-code.

## Layout

```
infrastructure/
├── docker/                    Dockerfiles + docker-compose for local boot
├── k8s/                       Kubernetes manifests (Deployments, Services, HPAs)
└── terraform/                 AWS infra: EKS, RDS, MSK, S3, IAM
```

## Notes

- Local development uses Docker Compose (`infrastructure/docker/`).
- Production runs on AWS EKS, provisioned via Terraform in this folder.
- Secrets are read from AWS Secrets Manager at runtime; no plaintext secrets in manifests.
- `terraform.tfstate` is git-ignored and lives in an encrypted S3 backend.
