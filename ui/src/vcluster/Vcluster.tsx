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
import {Box, CircularProgress, Stack} from "@mui/material";
import Typography from '@mui/material/Typography';
import {blueGrey} from "@mui/material/colors";
import {Alert, AlertTitle} from "@mui/lab";

const ddClient = createDockerDesktopClient();

const refreshData = async (setCurrentK8sContext: React.Dispatch<React.SetStateAction<any>>, setVClusters: React.Dispatch<React.SetStateAction<any>>, setNamespaces: React.Dispatch<React.SetStateAction<any>>) => {
    try {
        const result = await Promise.all([getCurrentK8sContext(ddClient), listVClusters(ddClient), listNamespaces(ddClient)]);
        setCurrentK8sContext(result[0]);
        setVClusters(result[1]);
        setNamespaces(result[2]);
    } catch (err) {
        console.log("error", JSON.stringify(err));
        setCurrentK8sContext("");
    }
}

const refreshContext = async (setIsDDK8sEnabled: React.Dispatch<React.SetStateAction<any>>) => {
    try {
        let isDDK8sEnabled = await updateDockerDesktopK8sKubeConfig(ddClient);
        console.log("isDDK8sEnabled[interval] : ", isDDK8sEnabled)
        setIsDDK8sEnabled(isDDK8sEnabled)
    } catch (err) {
        console.log("error", JSON.stringify(err));
        setIsDDK8sEnabled(false);
    }
}

const checkIfDDK8sEnabled = async (setIsLoading: React.Dispatch<React.SetStateAction<any>>) => {
    try {
        setIsLoading(true);
        let isDDK8sEnabled = await updateDockerDesktopK8sKubeConfig(ddClient);
        setIsLoading(false);
        return isDDK8sEnabled
    } catch (err) {
        console.log("error", JSON.stringify(err));
        setIsLoading(false);
    }
    return false;
}

export const VCluster = () => {
    const [vClusters, setVClusters] = React.useState(undefined);
    const [namespaces, setNamespaces] = React.useState([]);
    const [currentK8sContext, setCurrentK8sContext] = React.useState("");
    const [isDDK8sEnabled, setIsDDK8sEnabled] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    useEffect(() => {
        (async () => {
            let isDDK8sEnabled = await checkIfDDK8sEnabled(setIsLoading);
            console.log("isDDK8sEnabled : ", isDDK8sEnabled)
            await setIsDDK8sEnabled(isDDK8sEnabled)
            if (isDDK8sEnabled) {
                await refreshData(setCurrentK8sContext, setVClusters, setNamespaces)
            }
        })();
        const contextInterval = setInterval(() => refreshContext(setIsDDK8sEnabled), 5000);
        const dataInterval = setInterval(() => refreshData(setCurrentK8sContext, setVClusters, setNamespaces), 5000);
        return () => {
            clearInterval(dataInterval);
            clearInterval(contextInterval);
        }
    }, []);

    const createUIVC = async (name: string, namespace: string, distro: string, chartVersion: string, values: string) => {
        try {
            if (!namespace) {
                namespace = "vcluster-" + name.toLowerCase();
            }
            const isCreated = await createVCluster(ddClient, name, namespace, distro, chartVersion, values);
            if (isCreated) {
                ddClient.desktopUI.toast.success("vcluster created successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster create failed");
            }

            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces);
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster create failed: " + JSON.stringify(err));
        }
    };

    const upgradeUIVC = async (name: string, namespace: string, chartVersion: string, values: string) => {
        try {
            // Using the same createVCluster function for the upgrade operation. Distro upgrade is not supported
            const isUpgraded = await createVCluster(ddClient, name, namespace, "", chartVersion, values, true);
            if (isUpgraded) {
                ddClient.desktopUI.toast.success("vcluster upgraded successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster upgrade failed");
            }

            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces);
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster upgrade failed: " + JSON.stringify(err));
        }
    };

    const deleteUIVC = async (name: string, namespace: string) => {
        try {
            const isDeleted = await deleteVCluster(ddClient, name, namespace);
            if (isDeleted) {
                ddClient.desktopUI.toast.success("vcluster deleted successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] delete failed");
            }

            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces);
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster delete failed: " + JSON.stringify(err));
        }
    };

    const pauseUIVC = async (name: string, namespace: string) => {
        try {
            const isPaused = await pauseVCluster(ddClient, name, namespace);
            if (isPaused) {
                ddClient.desktopUI.toast.success("vcluster paused successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster pause failed");
            }

            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces);
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster pause failed: " + JSON.stringify(err));
        }
    };

    const resumeUIVC = async (name: string, namespace: string) => {
        try {
            const isResumed = await resumeVCluster(ddClient, name, namespace);
            if (isResumed) {
                ddClient.desktopUI.toast.success("vcluster resumed successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster resume failed");
            }

            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces);
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster resume failed : " + JSON.stringify(err));
        }
    };

    const disconnectUIVC = async (namespace: string, context: string) => {
        try {
            const isDisconnected = await disconnectVCluster(ddClient, namespace, context);
            if (isDisconnected) {
                ddClient.desktopUI.toast.success("vcluster disconnected successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster disconnect failed");
            }

            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces);
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster disconnect failed: " + JSON.stringify(err));
        }
    };

    const connectUIVC = async (name: string, namespace: string) => {
        try {
            const isConnected = await connectVCluster(ddClient, name, namespace);
            if (isConnected) {
                ddClient.desktopUI.toast.success("vcluster connected successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster connect failed");
            }

            await refreshData(setCurrentK8sContext, setVClusters, setNamespaces);
        } catch (err) {
            ddClient.desktopUI.toast.error("vcluster connect failed: " + JSON.stringify(err));
        }
    };

    let component
    if (isLoading) {
        component = <Box sx={{
            marginBottom: "15px",
            textAlign: "center"
        }}>
            <CircularProgress
                size={50}
                sx={{
                    color: blueGrey[500],
                }}
            />
        </Box>
    } else {
        if (isDDK8sEnabled) {
            component = <React.Fragment>
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
            </React.Fragment>
        } else {
            component = <Box>
                <Alert severity="error">
                    <AlertTitle>Kubernetes failure</AlertTitle>
                    <Typography variant="h2">
                        Seems like Kubernetes is not enabled in your Docker Desktop. Please take a look at the [<a
                        href="https://docs.docker.com/desktop/kubernetes/">docker
                        documentation</a>] on how to enable the Kubernetes server.
                    </Typography>
                </Alert>
            </Box>
        }
    }
    return <Stack direction="column" spacing={2}>
        <Box sx={{
            marginBottom: "15px",
            textAlign: "left"
        }}>
            <Typography variant="h3">
                Create fully functional virtual Kubernetes clusters - Each vcluster runs inside a namespace of the
                underlying k8s cluster. It's cheaper than creating separate full-blown clusters and it offers better
                multi-tenancy and isolation than regular namespaces.
            </Typography>
        </Box>
        {component}
    </Stack>;
}
