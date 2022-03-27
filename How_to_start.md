- Create secret using following command

        kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf

- Run following to see the secret

        kubectl get secrets

- Run following to start skaffold server

        skaffold dev

- Start minikube

        skaffold config set --global local-cluster true
        eval $(minikube -p custom docker-env)

# install

- install minikube

        sudo dpkg -i minikube_latest_amd64.deb

- config minikube

        minikube config set driver docker
        minikube delete
        minikube start

- install kubectl

  - install from https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/

- install skaffold from official site

- run

        skaffold config set --global local-cluster true
        eval $(minikube -p minikube docker-env)


# for ingress
- run 

        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/cloud/deploy.yaml

- run

        kubectl wait --namespace ingress-nginx \  
                --for=condition=ready pod \
                --selector=app.kubernetes.io/component=controller \
                --timeout=120s
