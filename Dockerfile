FROM golang:1.18.3-alpine3.16 AS builder
ENV CGO_ENABLED=0

RUN apk add --update make

WORKDIR /backend

COPY Makefile Makefile
COPY go.mod go.mod
COPY go.sum go.sum
COPY vendor/ vendor/
COPY vm/ vm/

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    make bin

FROM --platform=$BUILDPLATFORM node:18.3.0-alpine3.16 AS client-builder

WORKDIR /ui

# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json

RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci

# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="vcluster" \
    org.opencontainers.image.description="Manage your vclusters running on docker-desktop." \
    org.opencontainers.image.vendor="Loft Inc." \
    org.opencontainers.image.licenses="Apache-2.0" \
    com.docker.desktop.extension.icon="https://i.ibb.co/mXhVjv8/vcluster.png" \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.screenshots="[{\"alt\": \"vcluster\", \"url\": \"https://raw.githubusercontent.com/loft-sh/vcluster-dd-extension/master/media/vcluster-screenshot.png?token=GHSAT0AAAAAABQI4KZDD64Z22DEU2L76KQQYWETAXA\"},{\"alt\": \"vcluster\", \"url\": \"https://www.vcluster.com/docs/media/diagrams/vcluster-architecture.svg\"}]" \
    com.docker.extension.detailed-description="Create fully functional virtual Kubernetes clusters - Each vcluster runs inside a namespace of the underlying k8s cluster. It's cheaper than creating separate full-blown clusters and it offers better multi-tenancy and isolation than regular namespaces." \
    com.docker.extension.publisher-url="https://www.vcluster.com" \
    com.docker.extension.additional-urls="[{\"title\":\"vcluster\",\"url\":\"https:\/\/vcluster.com\"},{\"title\":\"vcluster Documentation\",\"url\":\"https:\/\/vcluster.com/docs\"},{\"title\":\"Loft Inc.\",\"url\":\"https:\/\/loft.sh\"}]" \
    com.docker.extension.changelog="<li>Create/Delete/Upgrade vcluster</li><li>Pause/Resume vcluster</li><li>Connect/Disconnect vcluster</li>"

RUN apk add curl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl \
    && chmod +x ./kubectl && mv ./kubectl /usr/local/bin/kubectl \
    && curl -s -L "https://github.com/loft-sh/vcluster/releases/latest" | sed -nE 's!.*"([^"]*vcluster-linux-amd64)".*!https://github.com\1!p' | xargs -n 1 curl -L -o vcluster \
    && chmod +x vcluster && mv vcluster /usr/local/bin \
    && curl -LO https://get.helm.sh/helm-v3.9.0-linux-amd64.tar.gz \
    && tar -xzf helm-v3.9.0-linux-amd64.tar.gz && mv linux-amd64/helm /usr/local/bin/helm && chmod +x /usr/local/bin/helm && rm helm-v3.9.0-linux-amd64.tar.gz \
    && mkdir /linux \
    && cp /usr/local/bin/kubectl /linux/ \
    && cp /usr/local/bin/vcluster /linux/ \
    && cp /usr/local/bin/helm /linux/

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl" \
    && curl -s -L "https://github.com/loft-sh/vcluster/releases/latest" | sed -nE 's!.*"([^"]*vcluster-darwin-amd64)".*!https://github.com\1!p' | xargs -n 1 curl -L -o vcluster \
    && curl -LO https://get.helm.sh/helm-v3.9.0-darwin-amd64.tar.gz \
    && tar -xzf helm-v3.9.0-darwin-amd64.tar.gz && rm helm-v3.9.0-darwin-amd64.tar.gz \
    && mkdir /darwin \
    && chmod +x ./kubectl && mv ./kubectl /darwin/ \
    && chmod +x ./vcluster && mv ./vcluster /darwin/ \
    && chmod +x darwin-amd64/helm && mv darwin-amd64/helm /darwin/

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/windows/amd64/kubectl.exe" \
    && curl -s -L "https://github.com/loft-sh/vcluster/releases/latest" | sed -nE 's!.*"([^"]*vcluster-windows-amd64.exe)".*!https://github.com\1!p' | xargs -n 1 curl -L -o vcluster.exe \
    && curl -LO https://get.helm.sh/helm-v3.9.0-windows-amd64.zip \
    && unzip helm-v3.9.0-windows-amd64.zip \
    && mkdir /windows \
    && chmod +x ./kubectl.exe && mv ./kubectl.exe /windows/ \
    && chmod +x ./vcluster.exe && mv ./vcluster.exe /windows/ \
    && chmod +x windows-amd64/helm.exe && mv windows-amd64/helm.exe /windows/

RUN mkdir -p /root/.kube
RUN touch /root/.kube/config
ENV KUBECONFIG=/root/.kube/config
COPY metadata.json .
COPY vcluster.svg .
COPY --from=builder /backend/bin/service /
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/vcluster-dd-extension.sock
