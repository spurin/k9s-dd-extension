FROM golang:1.18.3-alpine3.16 AS builder
ENV CGO_ENABLED=0
RUN apk add --update make
WORKDIR /backend
COPY go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY . .
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
LABEL org.opencontainers.image.title="vcluster-dd-extension" \
    org.opencontainers.image.description="vcluster Docker Extension" \
    org.opencontainers.image.vendor="Loft Inc." \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.screenshots="[{\"alt\": \"vcluster \", \"url\": \"https://www.vcluster.com/docs/media/diagrams/vcluster-architecture.svg\"}]" \
    com.docker.extension.detailed-description="Virtual clusters run inside namespaces of other clusters. They have a separate API server and a separate data store, so every Kubernetes object you create in the vcluster only exists inside the vcluster." \
    com.docker.extension.publisher-url="https://www.vcluster.com" \
    com.docker.extension.additional-urls="[{\"title\":\"Loft Inc.\",\"url\":\"https:\/\/loft.sh\"}]" \
    com.docker.extension.changelog="<p>Extension changelog<ul> <li>New feature A</li> <li>Bug fix on feature B</li></ul></p>"

COPY --from=builder /backend/bin/service /
RUN apk add curl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl  \
    && chmod +x ./kubectl && mv ./kubectl /usr/local/bin/kubectl

COPY docker-compose.yaml .
COPY metadata.json .
COPY vcluster.svg .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/vcluster-dd-extension.sock
