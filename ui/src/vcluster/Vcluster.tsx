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
import {Box, Stack, Typography} from "@mui/material";

const ddClient = createDockerDesktopClient();

const refreshData = async (setCurrentK8sContext: any, setVClusters: any, setNamespaces: any) => {
    try {
        const result = await Promise.all([getCurrentK8sContext(ddClient), listVClusters(ddClient), listNamespaces(ddClient)]);
        setCurrentK8sContext(result[0]);
        setVClusters(result[1]);
        setNamespaces(result[2]);
    } catch (err) {
        console.log(err);
        setCurrentK8sContext("");
    }
}

const VCluster = () => {
    const [vClusters, setVClusters] = React.useState(undefined);
    const [namespaces, setNamespaces] = React.useState([]);
    const [currentK8sContext, setCurrentK8sContext] = React.useState("");

    useEffect(() => {
        (async () => {
            try {
                await updateDockerDesktopK8sKubeConfig(ddClient);
            } catch (err) {
                console.log("error", err);
            }
            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces);
        })();

        const interval = setInterval(() => refreshData(setCurrentK8sContext, setVClusters, setNamespaces), 5000);
        return () => clearInterval(interval);
    }, []);

    const createUIVC = async (name: string, namespace: string, distro: string, chartVersion: string, values: string) => {
        try {
            if (!namespace) {
                namespace = "vcluster-" + name.toLowerCase();
            }
            const isCreated = await createVCluster(ddClient, name, namespace, distro, chartVersion, values);
            if (isCreated) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] create triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] create failed");
            }
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] create failed : " + JSON.stringify(err));
        }
    };

    const upgradeUIVC = async (name: string, namespace: string, chartVersion: string, values: string) => {
        try {
            // Using the same createVCluster function for the upgrade operation. Distro upgrade is not supported
            const isUpgraded = await createVCluster(ddClient, name, namespace, "", chartVersion, values, true);
            if (isUpgraded) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] upgrade triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] upgrade failed");
            }
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] upgrade failed : " + JSON.stringify(err));
        }
    };

    const deleteUIVC = async (name: string, namespace: string) => {
        try {
            const isDeleted = await deleteVCluster(ddClient, name, namespace);
            if (isDeleted) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] delete triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] delete failed");
            }
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] delete failed : " + JSON.stringify(err));
        }
    };

    const pauseUIVC = async (name: string, namespace: string) => {
        try {
            const isPaused = await pauseVCluster(ddClient, name, namespace);
            if (isPaused) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] pause triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] pause failed");
            }
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] pause failed : " + JSON.stringify(err));
        }
    };

    const resumeUIVC = async (name: string, namespace: string) => {
        try {
            const isResumed = await resumeVCluster(ddClient, name, namespace);
            if (isResumed) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] resume triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] resume failed");
            }
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] resume failed : " + JSON.stringify(err));
        }
    };

    const disconnectUIVC = async (namespace: string, context: string) => {
        try {
            const isDisconnected = await disconnectVCluster(ddClient, namespace, context);
            if (isDisconnected) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + "] disconnect triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + "] disconnect failed");
            }
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster[" + namespace + "] disconnect failed : " + JSON.stringify(err));
        }
    };

    const connectUIVC = async (name: string, namespace: string) => {
        try {
            const isConnected = await connectVCluster(ddClient, name, namespace);
            if (isConnected) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] connect triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] connect failed");
            }
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] connect failed : " + JSON.stringify(err));
        }
    };

    return <Stack direction="column" spacing={2}>
        <Box sx={{
            marginBottom: "15px",
            textAlign: "center"
        }}>
            <Typography>
                Create fully functional virtual Kubernetes clusters - Each vcluster runs inside a namespace of the
                underlying k8s cluster. It's cheaper than creating separate full-blown clusters and it offers better
                multi-tenancy and isolation than regular namespaces.
            </Typography>
        </Box>
        <VClusterCreate
            createUIVC={createUIVC}
            namespaces={namespaces}/>
        <VClusterList
            upgradeUIVC={upgradeUIVC}
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
