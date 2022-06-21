import {DockerDesktop} from "./constants";

// Common function to call vm.cli.exec
async function cli(ddClient, command, args) {
    return await ddClient.extension.vm.cli.exec(command, args);
}

// Retrieves all the vclusters from docker-desktop kubernetes
export async function listVClusters(ddClient) {
    // vcluster list --output json
    let output = await cli(ddClient, "vcluster", ["list", "--output", "json"]);
    if (output.stderr) {
        console.log("[listVClusters] : ", output.stderr)
        return []
    }
    return JSON.parse(output.stdout)
}

// Create vcluster on docker-desktop kubernetes
export async function createVCluster(ddClient, name, namespace, distro, chartVersion, values) {
    // vcluster create name -n namespace --distro k3s --chart-version 0.9.1 --values string
    let args = ["create", name]

    if (namespace) {
        args.push("--namespace")
        args.push(namespace)
    } else {
        args.push("--namespace")
        args.push("vcluster-" + name)
    }
    if (distro) {
        args.push("--distro")
        args.push(distro)
    }
    if (chartVersion) {
        args.push("--chart-version")
        args.push(chartVersion)
    }
    if(values){
        args.push("--extra-values")
        args.push(values)
    }
    let output = await cli(ddClient, "vcluster", args);
    if (output.stderr) {
        console.log("[createVClusters] : ", output.stderr)
        return output.stderr
    }
    return true
}

// Resumes the vcluster
export async function resumeVCluster(ddClient, name, namespace) {
    // vcluster resume cluster-2 -n vcluster-dev
    let output = await cli(ddClient, "vcluster", ["resume", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[resumeVCluster] : ", output.stderr)
        return false
    }
    return true
}

// Pauses the vcluster
export async function pauseVCluster(ddClient, name, namespace) {
    // vcluster pause cluster-2 -n vcluster-dev
    let output = await cli(ddClient, "vcluster", ["pause", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[pauseVCluster] : ", output.stderr)
        return false
    }
    return true
}

// Deletes the vcluster
export async function deleteVCluster(ddClient, name, namespace) {
    // vcluster delete name -n namespace
    let output = await cli(ddClient, "vcluster", ["delete", name, "-n", namespace]);
    if (output.stderr) {
        console.log("[deleteVCluster] : ", output.stderr)
        return false
    }
    return true
}

// Lists all namespaces from docker-desktop kubernetes
export async function listNamespaces(ddClient) {
    // kubectl get ns --no-headers -o custom-columns=":metadata.name"
    let output = await cli(ddClient, "kubectl", ["get", "namespaces", "--no-headers", "-o", "custom-columns=\":metadata.name\""]);
    if (output.stderr) {
        console.log("[listNamespaces] : ", output.stderr)
        return []
    }

    const nsNameList = []
    output.stdout.split("\n").forEach(namespace => {
        const trimmed = namespace.trim();
        if (trimmed) {
            nsNameList.push(trimmed)
        }
    });
    return nsNameList
}

// Runs `vcluster disconnect` command on host and changes the context back to older context.
export async function disconnectVCluster(ddClient, namespace, context) {
    // vcluster disconnect --namespace namespace --context context
    const disconnect = await ddClient.extension.host.cli.exec("vcluster", ["disconnect", "-n", namespace]);
    if (disconnect.stderr) {
        console.log("[disconnectVCluster] : ", disconnect.stderr)
        return false
    }

    return true
}

// Runs `vcluster connect` command on host and changes the context is changed internally.
export async function connectVCluster(ddClient, name, namespace) {
    // vcluster connect name -n namespace
    const connect = await ddClient.extension.host.cli.exec("vcluster", ["connect", name, "-n", namespace, "--context", DockerDesktop]);
    if (connect.stderr) {
        console.log("[connectVCluster] : ", connect.stderr)
        return false
    }

    return true
}

// Gets docker-desktop kubeconfig file from local and save it in container's /root/.kube/config file-system.
// We have to use the vm.service to call the post api to store the kubeconfig retrieved. Without post api in vm.service
// all the combinations of commands fail
export async function updateDockerDesktopK8sKubeConfig(ddClient) {
    // kubectl config view --raw
    let kubeConfig = await ddClient.extension.host.cli.exec("kubectl", ["config", "view", "--raw", "--minify", "--context", DockerDesktop]);
    if (kubeConfig.stderr) {
        return false
    }

    // call backend to store the kubeconfig retrieved
    try {
        await cli()
        await ddClient.extension.vm.service.post("/store-kube-config", {data: kubeConfig.stdout})
    } catch(err) {
        console.log("error", err)
    }

    return true
}

// Retrieves host's current k8s context
export async function getCurrentK8sContext(ddClient) {
    // kubectl config view -o jsonpath='{.current-context}'
    let output = await ddClient.extension.host.cli.exec("kubectl", ["config", "view", "-o", "jsonpath='{.current-context}'"]);
    if (output.stderr) {
        console.log("[getCurrentK8sContext] : ", output.stderr)
        return {}
    }
    return output.stdout
}

// Retrieves container's current k8s context
export async function getContainerK8sContext(ddClient) {
    // kubectl config view -o jsonpath='{.contexts}'
    let output = await cli(ddClient, "kubectl", ["config", "view", "-o", "jsonpath='{.contexts}'"]);
    if (output.stderr) {
        console.log("[getContainerK8sContext] : ", output.stderr)
        return {}
    }
    return JSON.parse(output.stdout).length > 0 ? JSON.parse(output.stdout)[0] : {}
}