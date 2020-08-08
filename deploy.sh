docker build -t brandoncjw/multi-client:latest -t brandoncjw/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t brandoncjw/multi-server:latest -t brandoncjw/multi-server:$SHA -f ./server/Dockerile ./server
docker build -t brandoncjw/multi-worker:latest -t brandoncjw/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push brandoncjw/multi-client:latest
docker push brandoncjw/multi-server:latest
docker push brandoncjw/multi-worker:latest

docker push brandoncjw/multi-client:$SHA
docker push brandoncjw/multi-server:$SHA
docker push brandoncjw/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/client-deployment client=brandoncjw/multi-client:$SHA
kubectl set image deployments/server-deployment server=brandoncjw/multi-server:$SHA
kubectl set image deployments/worker-deployment worker=brandoncjw/mutli-worker:$SHA