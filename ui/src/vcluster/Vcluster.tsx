import React, {useEffect} from "react";
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "../App.css";
import {
    connectVCluster,
    createVCluster,
    deleteVCluster,
    disconnectVCluster,
    getCurrentK8sContext,
    listNamespaces,
    listVClusters,
    pauseVCluster,
    resumeVCluster,
    updateDockerDesktopK8sKubeConfig
} from "../helper/cli";
import {VClusterList} from "./List";
import {VClusterCreate} from "./Create";
import {Stack} from "@mui/material";

const ddClient = createDockerDesktopClient();

const refreshData = async (setCurrentK8sContext: any, setVClusters: any, setNamespaces: any) => {
    try {
        const result = await Promise.all([getCurrentK8sContext(ddClient), listVClusters(ddClient), listNamespaces(ddClient)]);
        setCurrentK8sContext(result[0]);
        setVClusters(result[1]);
        setNamespaces(result[2]);
    } catch (err) {
        console.log(err);
        setCurrentK8sContext("")
    }
}

const VCluster = () => {
    const [vClusters, setVClusters] = React.useState(undefined);
    const [namespaces, setNamespaces] = React.useState([]);
    const [currentK8sContext, setCurrentK8sContext] = React.useState("");

    useEffect(() => {
        (async () => {
            try {
                await updateDockerDesktopK8sKubeConfig(ddClient)
            } catch (err) {
                console.log("error", err);
            }

            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces)
        })()

        const interval = setInterval(() => refreshData(setCurrentK8sContext, setVClusters, setNamespaces), 5000);
        return () => clearInterval(interval);
    }, []);

    const createUIVC = (name: string, namespace: string, distro: string, chartVersion: string, values: string) => {
        createVCluster(ddClient, name, namespace, distro, chartVersion, values).then(isCreated => {
            if (isCreated) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] create triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] create failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] create failed : " + JSON.stringify(reason)));
    };

    const deleteUIVC = (name: string, namespace: string) => {
        deleteVCluster(ddClient, name, namespace).then(isDeleted => {
            if (isDeleted) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] delete triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] delete failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] delete failed : " + JSON.stringify(reason)));
    };

    const pauseUIVC = (name: string, namespace: string) => {
        pauseVCluster(ddClient, name, namespace).then(isPaused => {
            if (isPaused) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] pause triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] pause failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] pause failed : " + JSON.stringify(reason)));
    };

    const resumeUIVC = (name: string, namespace: string) => {
        resumeVCluster(ddClient, name, namespace).then(isResumed => {
            if (isResumed) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] resume triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] resume failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] resume failed : " + JSON.stringify(reason)));
    };

    const disconnectUIVC = (namespace: string, context: string) => {
        disconnectVCluster(ddClient, namespace, context).then(isDisconnected => {
            if (isDisconnected) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + "] disconnect triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + "] disconnect failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + "] disconnect failed : " + JSON.stringify(reason)));
    };

    const connectUIVC = (name: string, namespace: string) => {
        connectVCluster(ddClient, name, namespace).then(isConnected => {
            if (isConnected) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] connect triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] connect failed");
            }
        }).catch(reason => {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] connect failed : " + JSON.stringify(reason));
            }
        );
    };

    return <Stack direction="column" spacing={2}>
        <div>Create fully functional virtual Kubernetes clusters - Each vcluster runs inside a namespace of the
            underlying k8s cluster. It's cheaper than creating separate full-blown clusters and it offers better
            multi-tenancy and isolation than regular namespaces.
        </div>
        <VClusterCreate
            createUIVC={createUIVC}
            namespaces={namespaces}/>
        <VClusterList
            deleteUIVC={deleteUIVC}
            pauseUIVC={pauseUIVC}
            resumeUIVC={resumeUIVC}
            disconnectUIVC={disconnectUIVC}
            connectUIVC={connectUIVC}
            vClusters={vClusters}
            currentK8sContext={currentK8sContext}
        />
    </Stack>;
}

export default VCluster;
