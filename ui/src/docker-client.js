async function dockerClient(ddClient, command, args, succsessMsg, failureMsg) {
    await ddClient.docker.cli.exec(command, args, {
        stream: {
            onOutput(data) {
                if (data.stdout) {
                    console.log(succsessMsg, data.stdout);
                } else {
                    console.error(failureMsg, data.stderr);
                }
            }, onError(error) {
                console.error(failureMsg, error);
            }
        },
    });
}

export async function createVolume(ddClient) {
    await dockerClient(ddClient, "volume", ["create", "loft-toolkit"], "[volume created] : ", "[volume creation failed] : ");
}

export async function createLoftToolKitContainer(ddClient) {
    await dockerClient(ddClient, "run", ["-d", "--name", "loft-toolkit", "-v", "loft-toolkit:/root/.kube", "loft-toolkit:0.0.2"], "[container created] : ", "[container creation failed] : ");
}

export async function deleteLoftToolKitVolume(ddClient) {
    await dockerClient(ddClient, "volume", ["rm", "loft-toolkit", "-f"], "[volume deleted] : ", "[volume deletion failed] : ");
}

export async function deleteLoftToolKitContainer(ddClient) {
    await dockerClient(ddClient, "container", ["rm", "loft-toolkit", "-f"], "[container deleted] : ", "[container deletion failed] : ");
}

export async function isLoftToolKitPodCreated(ddClient) {
    return true
}

export async function isLoftToolKitVolumeCreated(ddClient) {
    return true
}

export async function isLoftToolKitPodRunning(ddClient) {
    return true
}

export async function isLoftToolKitVolumeAttached(ddClient) {
    return true
}

export async function isK8sConnectionActive(ddClient) {
    return await isLoftToolKitPodRunning() && await isLoftToolKitVolumeAttached()
}

export async function resetK8sConnection(ddClient) {
    await deleteLoftToolKitContainer(ddClient)
    await deleteLoftToolKitVolume(ddClient)
}