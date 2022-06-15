# vcluster extension for Docker Desktop

This provides an extension integration with Docker Desktop to allow managing
vclusters quickly and easily through
the Docker Desktop interface.

## Prerequisites

In order to run this extension, you must have Docker Desktop 4.8.0 or later
installed.

If you would like to contribute or modify the extension, there are additional
requirements. This extension is comprised Go and React JavaScript code.
Building the extension can be done using containerized build tools, but you may
want to install development environments for these tools.

Runtime Requirements:

- [Docker Desktop 4.8.0 or later](https://www.docker.com/products/docker-desktop/)

Development Recommendations:

- [Go programming language](https://go.dev/doc/install)
- [React reference](https://reactjs.org)
- [Docker Extensions CLI](https://github.com/docker/extensions-sdk)

## Building and Installing

The standard way to get the vcluster extension for Docker
Desktop is by using the Docker Marketplace. This will install the official
released version of the extension.

If you are making local changes and would like to try them out, you will need
to follow these steps:

1. In Docker Desktop, go to Preferences > Kubernetes and make sure
   "Enable kubernetes" is checked.
2. In Docker Desktop, go to Preferences > Extensions and make sure
   "Enable Docker Extensions" is checked.
3. From a terminal, navigate to `vcluster-dd-extension`.
4. Run the following command to build and install the local extension after the kubernetes and docker are running:

   ```sh
   make build-install
   ```

5. From the Docker Dashboard you can now navigate to the Extensions section.
   It should now list *vcluster* as one of the available
   extensions. Click on *vcluster* from the list and you should
   be presented with the UI for managing the virtual clusters created on docker-desktop kubernetes.

### `Docker Extension` CLI Setup
https://docs.docker.com/desktop/extensions-sdk

Note: The build steps assume that the Docker Extensions CLI has been installed.
While `docker-extension` can be called directly, the installation target assumes it has been added as a CLI plugin and can be called as
`docker extension`.

If you have downloaded the `docker-extension` binary from their Releases page,
follow these steps to have it recognized as a CLI plugin under `docker`:

```sh
mkdir -p ~/.docker/cli-plugins
cp docker-extension ~/.docker/cli-plugins/
```

### Publishing
// In progress
[
The extension uses four "builder" containers for concurrent builds of the Tanzu CLI,
the backend utility, the React client, etc.

When building and publishing a new extension image,
ensure you have [authenticated to the GitHub container registry (ghcr).](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry)
This is where the multi architecture builder images are stored and pushed to.
When building the extension image for multiple architectures,
in order to support _building from_ multiple architectures,
these builder images are used (and pulled from ghcr) to generate the final image
which is then pushed to Dockerhub.

To build everything with a tag, including the extension itself, use:

```sh
TAG=1.2.3 make build-push-everything
```

Note the `V_CI_BUILD` env var.
This is to ensure caution and promote only publishing from CI/CD.

To use existing builder images in ghcr, without going through the processes
of rebuilding them and pushing them to ghcr, use:

```sh
V_CI_BUILD=true TAG=1.2.3 make build-push-extension
```
]
