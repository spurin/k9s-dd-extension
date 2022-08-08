import {DockerDesktop} from "./constants";
import {v1} from "@docker/extension-api-client-types";

// Common function to call vm.cli.exec
const cli = async (ddClient: v1.DockerDesktopClient, command: string, args: string[]) => {
    return ddClient.extension.vm?.cli.exec(command, args);
}

// Common function to call host.cli.exec
const hostCli = async (ddClient: v1.DockerDesktopClient, command: string, args: string[]) => {
    return ddClient.extension.host?.cli.exec(command, args);
}

const storeValuesFileInContainer = async (ddClient: v1.DockerDesktopClient, values: string) => {
    return ddClient.extension.vm?.service?.post("/store-values", {data: values});
}

// Gets the kubeconfig file from local and save it in container's /root/.kube/config file-system.
// We have to use the vm.service to call the post api to store the kubeconfig retrieved. Without post api in vm.service
// all the combinations of commands fail
export const updateDockerDesktopK8sKubeConfig = async (ddClient: v1.DockerDesktopClient) => {
    // kubectl config view --raw
    let kubeConfig = await hostCli(ddClient, "kubectl", ["config", "view", "--raw", "--minify"]);
    if (kubeConfig?.stderr) {
        console.log("error", kubeConfig?.stderr);
        return false;
    }

    // call backend to store the kubeconfig retrieved
    try {
        await ddClient.extension.vm?.service?.post("/store-kube-config", {data: kubeConfig?.stdout})
    } catch (err) {
        console.log("error", JSON.stringify(err));
    }

    let output = await checkK8sConnection(ddClient);
    if (output?.stderr) {
        console.log("[checkK8sConnection] : ", output.stderr);
        return false;
    }
    if (output?.stdout) {
        console.log("[checkK8sConnection] : ", output?.stdout)
    }

    return true;
}

// Retrieves host's current k8s context
export const getCurrentK8sContext = async (ddClient: v1.DockerDesktopClient) => {
    // kubectl config view -o jsonpath='{.current-context}'
    let output = await hostCli(ddClient, "kubectl", ["config", "view", "-o", "jsonpath='{.current-context}'"]);
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

// Retrieves kubectl cluster-info
export const checkK8sConnection = async (ddClient: v1.DockerDesktopClient) => {
    // kubectl cluster-info
    return await cli(ddClient, "kubectl", ["--kubeconfig=/root/.kube/config", "cluster-info"]);
}
