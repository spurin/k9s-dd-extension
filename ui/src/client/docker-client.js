async function dockerClient(ddClient, command, args) {
    return await ddClient.docker.cli.exec(command, args);
}

export async function createVolume(ddClient) {
    // docker volume create loft-toolkit
    let output = await dockerClient(ddClient, "volume", ["create", "loft-toolkit"]);
    if (output.stdout) {
        console.log("[createVolume] : ", output.stdout)
    }
    console.log("[createVolume] : ", output.stderr)
}

export async function createLoftToolKitContainer(ddClient) {
    // docker run rm -d --name loft-toolkit -v loft-toolkit:/root/.kube loft-toolkit:0.0.2
    let output = await dockerClient(ddClient, "run", ["-d", "--name", "loft-toolkit", "-v", "loft-toolkit:/root/.kube", "loft-toolkit:0.0.2"]);
    if (output.stdout) {
        console.log("[createLoftToolKitContainer] : ", output.stdout)
    }
    console.log("[createLoftToolKitContainer] : ", output.stderr)
}

export async function deleteLoftToolKitVolume(ddClient) {
    // docker volume rm loft-toolkit -f
    let output = await dockerClient(ddClient, "volume", ["rm", "loft-toolkit", "-f"]);
    if (output.stdout) {
        console.log("[deleteLoftToolKitVolume] : ", output.stdout)
    }
    console.log("[deleteLoftToolKitVolume] : ", output.stderr)
}

export async function deleteLoftToolKitContainer(ddClient) {
    // docker container rm loft-toolkit -f
    let output = await dockerClient(ddClient, "container", ["rm", "loft-toolkit", "-f"]);
    if (output.stdout) {
        console.log("[deleteLoftToolKitContainer] : ", output.stdout)
    }
    console.log("[deleteLoftToolKitContainer] : ", output.stderr)
}

export async function isLoftToolKitPodCreated(ddClient) {
    // docker ps -q -f name="loft-toolkit"
    let output = await dockerClient(ddClient, "ps", ["-q", "-f", "name=loft-toolkit"]);
    if (output.stdout) {
        console.log("[isLoftToolKitPodCreated] : ", output.stdout)
        return true
    }
    console.log("[isLoftToolKitPodCreated] : ", output.stderr)
    return false
}

export async function isLoftToolKitVolumeCreated(ddClient) {
    // docker volume inspect loft-toolkit
    let output = await dockerClient(ddClient, "volume", ["inspect", "loft-toolkit"]);
    if (output.stdout) {
        console.log("[isLoftToolKitVolumeCreated] : ", output.stdout)
        return true
    }
    console.log("[isLoftToolKitVolumeCreated] : ", output.stderr)
    return false
}

export async function isLoftToolKitPodRunning(ddClient) {
    // docker container inspect -f '{{.State.Running}}' loft-toolkit
    let output = await dockerClient(ddClient, "container", ["inspect", "-f", "'{{.State.Running}}'", "loft-toolkit"]);
    if (output.stdout) {
        console.log("[isLoftToolKitPodRunning] : ", output.stdout)
        return true
    }
    console.log("[isLoftToolKitPodRunning] : ", output.stderr)
    return false
}

export async function isLoftToolKitVolumeAttached(ddClient) {
    // docker inspect -f '{{ .Mounts }}' loft-toolkit
    let output = await dockerClient(ddClient, "inspect", ["-f", "'{{ .Mounts }}'", "loft-toolkit"]);
    if (output.stdout) {
        console.log("[isLoftToolKitVolumeAttached] : ", output.stdout)
        let splitted = output.stdout.replace("}", "").replace("{", "").replace("[", "").replace("]", "").split(" ")
        console.debug(splitted)
        return splitted.includes("loft-toolkit");
    }
    console.log("[isLoftToolKitVolumeAttached] : ", output.stderr)
    return false
}

export async function isK8sConnectionActive(ddClient) {
    return await isLoftToolKitPodRunning() && await isLoftToolKitVolumeAttached()
}

export async function resetK8sConnection(ddClient) {
    await deleteLoftToolKitContainer(ddClient)
    await deleteLoftToolKitVolume(ddClient)
}