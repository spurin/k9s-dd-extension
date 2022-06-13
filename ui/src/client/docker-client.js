async function dockerClient(ddClient, command, args) {
    return await ddClient.docker.cli.exec(command, args);
}

export async function createVolume(ddClient) {
    // docker volume create loft-toolkit
    let output = await dockerClient(ddClient, "volume", ["create", "loft-toolkit"]);
    if (output.stderr) {
        console.log("[createVolume] : ", output.stderr)
        return false
    }
    console.log("[createVolume] : ", output.stdout)
    return true
}

export async function createLoftToolKitContainer(ddClient) {
    // docker run rm -d --name loft-toolkit -v loft-toolkit:/root/.kube loft-toolkit:0.0.2
    let output = await dockerClient(ddClient, "run", ["-d", "--name", "loft-toolkit", "-v", "loft-toolkit:/root/.kube", "loft-toolkit:0.0.2"]);
    if (output.stderr) {
        console.log("[createLoftToolKitContainer] : ", output.stderr)
        return false
    }
    console.log("[createLoftToolKitContainer] : ", output.stdout)
    return true
}

export async function deleteLoftToolKitVolume(ddClient) {
    // docker volume rm loft-toolkit -f
    let output = await dockerClient(ddClient, "volume", ["rm", "loft-toolkit", "-f"]);
    if (output.stderr) {
        console.log("[deleteLoftToolKitVolume] : ", output.stderr)
        return false
    }
    console.log("[deleteLoftToolKitVolume] : ", output.stdout)
    return true
}

export async function deleteLoftToolKitContainer(ddClient) {
    // docker container rm loft-toolkit -f
    let output = await dockerClient(ddClient, "container", ["rm", "loft-toolkit", "-f"]);
    if (output.stderr) {
        console.log("[deleteLoftToolKitContainer] : ", output.stderr)
        return false
    }
    console.log("[deleteLoftToolKitContainer] : ", output.stdout)
    return true
}

export async function isLoftToolKitPodCreated(ddClient) {
    // docker ps -q -f name="loft-toolkit"
    let output = await dockerClient(ddClient, "ps", ["-q", "-f", "name=loft-toolkit"]);
    if (output.stderr) {
        console.log("[isLoftToolKitPodCreated] : ", output.stderr)
        return false
    }
    console.log("[isLoftToolKitPodCreated] : ", output.stdout)
    return true
}

export async function isLoftToolKitVolumeCreated(ddClient) {
    // docker volume inspect loft-toolkit
    let output = await dockerClient(ddClient, "volume", ["inspect", "loft-toolkit"]);
    if (output.stderr) {
        console.log("[isLoftToolKitVolumeCreated] : ", output.stderr)
        return false
    }
    console.log("[isLoftToolKitVolumeCreated] : ", output.stdout)
    return true
}

export async function listVClusters(ddClient) {
    // docker exec loft-toolkit vcluster list --output json
    let output = await dockerClient(ddClient, "exec", ["loft-toolkit", "vcluster", "list", "--output", "json"]);
    if (output.stderr) {
        console.log("[listVClusters] : ", output.stderr)
        return []
    }
    console.log("[listVClusters] : ", output.stdout)
    return JSON.parse(output.stdout)
}

export async function listNamespaces(ddClient) {
    // docker exec loft-toolkit kubectl get namespaces --output json
    let output = await dockerClient(ddClient, "exec", ["loft-toolkit", "kubectl", "get", "namespaces", "--output", "json"]);
    if (output.stderr) {
        console.log("[listNamespaces] : ", output.stderr)
        return []
    }
    console.log("[listNamespaces] : ", output.stdout)
    let namespaceList = JSON.parse(output.stdout);
    let nsNameList = []
    namespaceList.items.forEach(namespace => {
        nsNameList.push(namespace.metadata.name)
    });
    console.log(nsNameList)
    return nsNameList
}

export async function createVClusters(ddClient, name, namespace) {
    // docker exec loft-toolkit vcluster create name -n namespace
    let output = await dockerClient(ddClient, "exec", ["loft-toolkit", "vcluster", "create", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[createVClusters] : ", output.stderr)
        return output.stderr
    }
    console.log("[createVClusters] : ", output.stdout)
    return true
}

export async function deleteVClusters(ddClient, name, namespace) {
    // docker exec loft-toolkit vcluster delete name -n namespace
    let output = await dockerClient(ddClient, "exec", ["loft-toolkit", "vcluster", "delete", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[deleteVClusters] : ", output.stderr)
        return false
    }
    console.log("[deleteVClusters] : ", output.stdout)
    return true
}

export async function isLoftToolKitPodRunning(ddClient) {
    // docker container inspect -f '{{.State.Running}}' loft-toolkit
    let output = await dockerClient(ddClient, "container", ["inspect", "-f", "'{{.State.Running}}'", "loft-toolkit"]);
    if (output.stderr) {
        console.log("[isLoftToolKitPodRunning] : ", output.stderr)
        return false
    }
    console.log("[isLoftToolKitPodRunning] : ", output.stdout)
    return true
}

export async function isLoftToolKitVolumeAttached(ddClient) {
    // docker inspect -f '{{ .Mounts }}' loft-toolkit
    let output = await dockerClient(ddClient, "inspect", ["-f", "'{{ .Mounts }}'", "loft-toolkit"]);
    if (output.stderr) {
        console.log("[isLoftToolKitVolumeAttached] : ", output.stderr)
        return false
    }
    console.log("[isLoftToolKitVolumeAttached] : ", output.stdout)
    let splitted = output.stdout.replace("}", "").replace("{", "").replace("[", "").replace("]", "").split(" ")
    console.debug(splitted)
    return splitted.includes("loft-toolkit");
}

export async function isK8sConnectionActive(ddClient) {
    return await isLoftToolKitPodRunning(ddClient) && await isLoftToolKitVolumeAttached(ddClient)
}

export async function resetK8sConnection(ddClient) {
    await deleteLoftToolKitContainer(ddClient)
    await deleteLoftToolKitVolume(ddClient)
}