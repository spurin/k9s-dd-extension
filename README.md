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

### `Docker Extension` CLI Setup

https://docs.docker.com/desktop/extensions-sdk

Note: The build steps assume that the Docker Extensions CLI has been installed.
While `docker-extension` can be called directly, the installation target assumes it has been added as a CLI plugin and
can be called as
`docker extension`.

If you have downloaded the `docker-extension` binary from their Releases page,
follow these steps to have it recognized as a CLI plugin under `docker`:

```sh
mkdir -p ~/.docker/cli-plugins
cp docker-extension ~/.docker/cli-plugins/
```

### Enable kubernetes and docker extensions
In Docker Desktop,
1.  Go to Preferences -> Kubernetes -> Check
   "Enable kubernetes".
2. Go to Preferences -> Extensions -> Check
   "Enable Docker Extensions".

### Three ways to run extension

#### Running published extension
The standard way to get the vcluster extension for Docker Desktop is by using the Docker Marketplace. This will install
the officially released version of the extension.

Go to Dashboard -> Add Extensions -> Click on Marketplace tab -> Search for vcluster -> Click on Install

#### Or Running unpublished extension
This is done when the testers/release-engineers want to verify the functionality from unpublished version with docker image released. Users can fire below command to install the extension on their machines.

`docker extension install loftsh/vcluster-dd-extension:0.0.6`

#### Or Building and Installing extension
If you are making local changes and would like to try them out, you will need
to follow these steps:

1. From a terminal, navigate to `vcluster-dd-extension` root directory.
2. Run the following command to build and install the local extension after the kubernetes and docker are running:

   ```sh
   make build-install
   ```
### Navigate to extension
From the Docker Dashboard you can now navigate to the Extensions section. It should now list *vcluster* as one of the
available extensions. Click on *vcluster* from the list and you should be presented with the UI for managing the virtual
clusters created on docker-desktop kubernetes.
