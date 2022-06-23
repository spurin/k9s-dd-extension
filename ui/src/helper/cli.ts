import {DockerDesktop} from "./constants";
import {v1} from "@docker/extension-api-client-types";

// Common function to call vm.cli.exec
const cli = async (ddClient: v1.DockerDesktopClient, command: string, args: string[]) => {
    return ddClient.extension.vm?.cli.exec(command, args);
}

const storeValuesFileInContainer = async (ddClient: v1.DockerDesktopClient, values: string) => {
    return ddClient.extension.vm?.service?.post("/store-values", {data: values});
}

// Retrieves all the vclusters from docker-desktop kubernetes
export const listVClusters = async (ddClient: v1.DockerDesktopClient) => {
    // vcluster list --output json
    let output = await cli(ddClient, "vcluster", ["list", "--output", "json"]);
    if (output?.stderr) {
        console.log("[listVClusters] : ", output.stderr)
        return [];
    }
    return JSON.parse(output?.stdout || "[]");
}

// Create vcluster on docker-desktop kubernetes
export const createVCluster = async (ddClient: v1.DockerDesktopClient, name: string, namespace: string, distro: string, chartVersion: string, values: string) => {
    // vcluster create name -n namespace --distro k3s --chart-version 0.9.1 --values string
    let args = ["create", name];

    if (namespace) {
        args.push("--namespace");
        args.push(namespace);
    }
    if (distro) {
        args.push("--distro");
        args.push(distro);
    }
    if (chartVersion) {
        args.push("--chart-version");
        args.push(chartVersion);
    }
    if (values) {
        // call backend to store the values
        try {
            let fileName = await storeValuesFileInContainer(ddClient, values);
            args.push("--extra-values");
            args.push(JSON.stringify(fileName));
        } catch (err) {
            console.log("error", err);
        }
    }
    args.push("--connect=false");

    let output = await cli(ddClient, "vcluster", args);

    if (output?.stderr) {
        console.log("[createVClusters] : ", output.stderr);
        return false;
    }
    return true;
}

// Resumes the vcluster
export const resumeVCluster = async (ddClient: v1.DockerDesktopClient, name: string, namespace: string) => {
    // vcluster resume cluster-2 -n vcluster-dev
    let output = await cli(ddClient, "vcluster", ["resume", name, "-n", namespace]);
    if (output?.stderr) {
        console.log("[resumeVCluster] : ", output.stderr);
        return false;
    }
    return true;
}

// Pauses the vcluster
export const pauseVCluster = async (ddClient: v1.DockerDesktopClient, name: string, namespace: string) => {
    // vcluster pause cluster-2 -n vcluster-dev
    let output = await cli(ddClient, "vcluster", ["pause", name, "-n", namespace]);
    if (output?.stderr) {
        console.log("[pauseVCluster] : ", output.stderr);
        return false;
    }
    return true;
}

// Deletes the vcluster
export const deleteVCluster = async (ddClient: v1.DockerDesktopClient, name: string, namespace: string) => {
    // vcluster delete name -n namespace
    let output = await cli(ddClient, "vcluster", ["delete", name, "-n", namespace]);
    if (output?.stderr) {
        console.log("[deleteVCluster] : ", output.stderr);
        return false;
    }
    return true;
}

// Lists all namespaces from docker-desktop kubernetes
export const listNamespaces = async (ddClient: v1.DockerDesktopClient) => {
    // kubectl get ns --no-headers -o custom-columns=":metadata.name"
    let output = await cli(ddClient, "kubectl", ["get", "namespaces", "--no-headers", "-o", "custom-columns=\":metadata.name\""]);
    if (output?.stderr) {
        console.log("[listNamespaces] : ", output.stderr);
        return [];
    }

    const nsNameList: string[] = []
    output?.stdout.split("\n").forEach((namespace: string) => {
        const trimmed = namespace.trim();
        if (trimmed) {
            nsNameList.push(trimmed);
        }
    });
    return nsNameList;
}

// Runs `vcluster disconnect` command on host and changes the context back to older context.
// noinspection JSUnusedLocalSymbols
export const disconnectVCluster = async (ddClient: v1.DockerDesktopClient, namespace: string, context: string) => {
    // vcluster disconnect --namespace namespace --context context
    const disconnect = await ddClient.extension.host?.cli.exec("vcluster", ["disconnect", "-n", namespace]);
    if (disconnect?.stderr) {
        console.log("[disconnectVCluster] : ", disconnect.stderr);
        return false;
    }

    return true;
}

// Runs `vcluster connect` command on host and changes the context is changed internally.
export const connectVCluster = async (ddClient: v1.DockerDesktopClient, name: string, namespace: string) => {
    // vcluster connect name -n namespace
    const connect = await ddClient.extension.host?.cli.exec("vcluster", ["connect", name, "-n", namespace, "--context", DockerDesktop]);
    if (connect?.stderr) {
        console.log("[connectVCluster] : ", connect.stderr);
        return false;
    }

    return true;
}

// Gets docker-desktop kubeconfig file from local and save it in container's /root/.kube/config file-system.
// We have to use the vm.service to call the post api to store the kubeconfig retrieved. Without post api in vm.service
// all the combinations of commands fail
export const updateDockerDesktopK8sKubeConfig = async (ddClient: v1.DockerDesktopClient) => {
    // kubectl config view --raw
    let kubeConfig = await ddClient.extension.host?.cli.exec("kubectl", ["config", "view", "--raw", "--minify", "--context", DockerDesktop]);
    if (kubeConfig?.stderr) {
        return false;
    }

    // call backend to store the kubeconfig retrieved
    try {
        await ddClient.extension.vm?.service?.post("/store-kube-config", {data: kubeConfig?.stdout})
    } catch (err) {
        console.log("error", err);
    }

    return true;
}

// Retrieves host's current k8s context
export const getCurrentK8sContext = async (ddClient: v1.DockerDesktopClient) => {
    // kubectl config view -o jsonpath='{.current-context}'
    let output = await ddClient.extension.host?.cli.exec("kubectl", ["config", "view", "-o", "jsonpath='{.current-context}'"]);
    if (output?.stderr) {
        console.log("[getCurrentK8sContext] : ", output.stderr);
        return {};
    }
    return output?.stdout;
}

// Retrieves container's current k8s context
export const getContainerK8sContext = async (ddClient: v1.DockerDesktopClient) => {
    // kubectl config view -o jsonpath='{.contexts}'
    let output = await cli(ddClient, "kubectl", ["config", "view", "-o", "jsonpath='{.contexts}'"]);
    if (output?.stderr) {
        console.log("[getContainerK8sContext] : ", output.stderr);
        return {};
    }
    return JSON.parse(output?.stdout || "[]").length > 0 ? JSON.parse(output?.stdout || "[]")[0] : {};
}