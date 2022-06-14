async function cli(ddClient, command, args) {
    return await ddClient.extension.vm.cli.exec(command, args);
}

export async function listVClusters(ddClient) {
    // vcluster list --output json
    let output = await cli(ddClient, "vcluster", ["list", "--output", "json"]);
    if (output.stderr) {
        console.log("[listVClusters] : ", output.stderr)
        return []
    }
    console.log("[listVClusters] : ", output.stdout)
    return JSON.parse(output.stdout)
}

export async function createVCluster(ddClient, name, namespace) {
    // vcluster create name -n namespace
    let output = await cli(ddClient, "vcluster", ["create", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[createVClusters] : ", output.stderr)
        return output.stderr
    }
    console.log("[createVClusters] : ", output.stdout)
    return true
}

export async function resumeVCluster(ddClient, name, namespace) {
    // vcluster resume cluster-2 -n vcluster-dev
    let output = await cli(ddClient, "vcluster", ["resume", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[resumeVCluster] : ", output.stderr)
        return false
    }
    console.log("[resumeVCluster] : ", output.stdout)
    return true
}

export async function pauseVCluster(ddClient, name, namespace) {
    // vcluster pause cluster-2 -n vcluster-dev
    let output = await cli(ddClient, "vcluster", ["pause", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[pauseVCluster] : ", output.stderr)
        return false
    }
    console.log("[pauseVCluster] : ", output.stdout)
    return true
}

export async function deleteVCluster(ddClient, name, namespace) {
    // vcluster delete name -n namespace
    let output = await cli(ddClient, "vcluster", ["delete", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[deleteVCluster] : ", output.stderr)
        return false
    }
    console.log("[deleteVCluster] : ", output.stdout)
    return true
}

export async function listNamespaces(ddClient) {
    // kubectl get ns --no-headers -o custom-columns=":metadata.name"
    let output = await cli(ddClient, "kubectl", ["get", "namespaces", "--no-headers", "-o", "custom-columns=\":metadata.name\""]);
    if (output.stderr) {
        console.log("[listNamespaces] : ", output.stderr)
        return []
    }
    console.log("[listNamespaces] : ", output.stdout)
    let nsNameList = []
    output.stdout.split("\n").forEach(namespace => {
        const trimmed = namespace.trim();
        if (trimmed) {
            nsNameList.push(trimmed)
        }
    });
    return nsNameList
}

export async function isK8sConnectionActive(ddClient) {
    return true
}
