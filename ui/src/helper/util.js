import yamlToJson from "js-yaml";
import {DockerDesktop} from "./constants";

// Converts the seconds to hh:mm:ss format
export const convertSeconds = function (date) {
    if (date) {
        let seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const SECONDS_PER_DAY = 86400;
        const HOURS_PER_DAY = 24;
        const days = Math.floor(seconds / SECONDS_PER_DAY);
        const remainderSeconds = seconds % SECONDS_PER_DAY;
        const hms = new Date(remainderSeconds * 1000).toISOString().substring(11, 19);
        const replaced = hms.replace(/^(\d+)/, h => `${Number(h) + days * HOURS_PER_DAY}`.padStart(2, '0'));
        const strings = replaced.split(":");
        let output = ""
        output += parseInt(strings[0]) > 0 ? parseInt(strings[0]) + "h" : ""
        output += parseInt(strings[1]) > 0 ? parseInt(strings[1]) + "m" : ""
        output += parseInt(strings[2]) > 0 ? parseInt(strings[2]) + "s" : ""
        return output
    }
    return ""
}

// Extracts docker-desktop from host config
export const filterContext = (kubeConfig) => {
    try {
        const newJsonKubeConfig = {}
        const jsonKubeConfig = yamlToJson.load(kubeConfig)
        const clusters = jsonKubeConfig["clusters"];
        const newClusters = []
        for (let i = 0; i < clusters.length; i++) {
            if (clusters[i].name === DockerDesktop) {
                newClusters.push(clusters[i])
            }
        }
        const contexts = jsonKubeConfig["contexts"];
        const newContexts = []
        for (let i = 0; i < contexts.length; i++) {
            if (contexts[i].name === DockerDesktop) {
                newContexts.push(contexts[i])
            }
        }
        const users = jsonKubeConfig["users"];
        const newUsers = []
        for (let i = 0; i < users.length; i++) {
            if (users[i].name === DockerDesktop) {
                newUsers.push(users[i])
            }
        }
        newJsonKubeConfig["contexts"] = newContexts
        newJsonKubeConfig["clusters"] = newClusters
        newJsonKubeConfig["users"] = newUsers
        newJsonKubeConfig["kind"] = "Config"
        newJsonKubeConfig["current-context"] = DockerDesktop
        newJsonKubeConfig["preferences"] = {}
        newJsonKubeConfig["apiVersion"] = "v1"
        return yamlToJson.dump(newJsonKubeConfig)
    } catch (error) {
        console.log(error)
    }
    return ""
}

// Converts into vCluster context format
export const getVClusterContextName = (name, namespace, context) => {
    return "vcluster_" + name + "_" + namespace + "_" + context
}