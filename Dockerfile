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
LABEL org.opencontainers.image.title="k9s" \
    org.opencontainers.image.description="k9s extension for docker-desktop." \
    org.opencontainers.image.vendor="James Spurin" \
    org.opencontainers.image.licenses="Apache-2.0" \
    com.docker.desktop.extension.icon="https://www.pngitem.com/pimgs/m/689-6895286_font-awesome-5-solid-paw-hd-png-download.png" \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="k9s terminal ui utility running against the internal Docker Desktop Kubernetes server" \
    com.docker.extension.publisher-url="https://github.com/spurin" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

RUN apk add curl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl \
    && chmod +x ./kubectl && mv ./kubectl /usr/local/bin/kubectl \
    && mkdir /linux \
    && cp /usr/local/bin/kubectl /linux/

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl" \
    && mkdir /darwin \
    && chmod +x ./kubectl && mv ./kubectl /darwin/

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/windows/amd64/kubectl.exe" \
    && mkdir /windows \
    && chmod +x ./kubectl.exe && mv ./kubectl.exe /windows/

RUN mkdir -p /root/.kube
RUN touch /root/.kube/config
ENV KUBECONFIG=/root/.kube/config
COPY metadata.json .
COPY k9s.svg .
COPY docker-compose.yaml .
COPY --from=builder /backend/bin/service /
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/k8s-dd-extension.sock
