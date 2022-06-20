import yamlToJson from "js-yaml";
import {DockerDesktop} from "./constants";

// Converts the seconds to hh:mm:ss format
export const convertSeconds = function (date) {
    if (date) {
        let seconds = Math.floor((new Date() - new Date(date)) / 1000);
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600*24));
        const h = Math.floor(seconds % (3600*24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);

        const dDisplay = d > 0 ? d + "d" : "";
        const hDisplay = h > 0 ? h + "h" : "";
        const mDisplay = m > 0 && d === 0 ? m + "m" : "";
        const sDisplay = s > 0 && d === 0 && h === 0 ? s + "s" : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }
    return ""
}

// Converts into vCluster context format
export const getVClusterContextName = (name, namespace, context) => {
    return "vcluster_" + name + "_" + namespace + "_" + context
}