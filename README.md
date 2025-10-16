# kubernetes-prometheus-sandbox

Project aims to test Helm Charts to deliver node.js server and monitoring using Prometheus and Grafana

## Architecture

- Node.js server (3 replicas)
- Frontend Nginx (2 replicas) with Nginx
- Redis
- Monitoring: Prometheus + Grafana
- Orchestration: Kubernetes + Helm

## Prerequisites

- Dokcer & Docker Hub account
- Minikube
- kubectl
- helm 3.x

## Steps

### 1. Build and push Docker images to Docker Hub (frontend, backend)

```bash
cd backend
docker build -t <your-dockerhub-username>/backend-api:v1.0 .
docker push <your-dockerhub-username>/backend-api:v1.0

cd ../frontend
docker build -t <your-dockerhub-username>/frontend-app:v1.0 .
docker push <your-dockerhub-username>/frontend-app:v1.0
```

### 2. Run minikube if not running

```bash
minikube start --cpus=4 --memory=4096
```

### 3. Install Redis using Helm

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install redis bitnami/redis --set auth.enabled=false --set master.persistence.enabled=false
```

### 4. Deploy the application

```bash
cd helm-charts
helm install devops-demo ./devops-demo
```

#### 4.1 Verify status of pods and services

```bash
kubectl get pods

kubectl get services
```

Wait until all pods are in `Running` state.

### 5. Access the application

```bash
minikube service frontend-service --url

minikube service prometheus --url

minikube service grafana --url
```

## Cleanup

```bash
helm uninstall devops-demo
helm uninstall redis

minikube stop

minikube delete
```
