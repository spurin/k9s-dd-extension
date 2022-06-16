import React, {useEffect} from "react";
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "../App.css";
import {
    connectVCluster,
    createVCluster,
    deleteVCluster,
    disconnectVCluster,
    getCurrentK8sContext,
    getDockerDesktopK8sKubeConfig,
    listNamespaces,
    listVClusters,
    pauseVCluster,
    resumeVCluster
} from "../helper/cli";
import VClusterList from "../vcluster/List";
import VClusterCreate from "../vcluster/Create";
import {Stack} from "@mui/material";

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

const VCluster = () => {
    const [vClusters, setVClusters] = React.useState([]);
    const [namespaces, setNamespaces] = React.useState([]);
    // const [containerK8sContext, setContainerK8sContext] = React.useState([]);
    const [currentK8sContext, setCurrentK8sContext] = React.useState([""]);

    const ddClient = useDockerDesktopClient();

    useEffect(() => {
        getDockerDesktopK8sKubeConfig(ddClient).then(kubeConfigFile => {
            console.log(kubeConfigFile)
        }).catch(reason => {
            // TODO if error then show a default page
            console.log(reason);
        });
        // TODO need to think of its better place on UI
        // getContainerK8sContext(ddClient).then(containerK8sContext => {
        //     console.log(containerK8sContext)
        //     setContainerK8sContext(containerK8sContext)
        // }).catch(reason => {
        //     console.log(reason);
        //     setContainerK8sContext({})
        // });
        //Todo -- to be put in the interval
        getCurrentK8sContext(ddClient).then(currentK8sContext => {
            console.log(currentK8sContext)
            setCurrentK8sContext(currentK8sContext)
        }).catch(reason => {
            console.log(reason);
            setCurrentK8sContext("")
        });
        listVClusters(ddClient)
            .then(value => setVClusters(value))
            .catch(reason => console.log(reason))
        listNamespaces(ddClient)
            .then(value => setNamespaces(value))
            .catch(reason => console.log(reason))
        // const interval = setInterval(() => {
        //     listVClusters(ddClient)
        //         .then(value => setVClusters(value))
        //         .catch(reason => console.log(reason))
        //     listNamespaces(ddClient)
        //         .then(value => setNamespaces(value))
        //         .catch(reason => console.log(reason))
        // }, 5000);
        // return () => clearInterval(interval);
    }, [ddClient]);

    const createUIVC = (name, namespace, distro, chartVersion) => {
        createVCluster(ddClient, name, namespace, distro, chartVersion).then(isCreated => {
            if (isCreated) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] create triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] create failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] create failed : " + JSON.stringify(reason)));
    };

    const deleteUIVC = (name, namespace) => {
        deleteVCluster(ddClient, name, namespace).then(isDeleted => {
            if (isDeleted) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] delete triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] delete failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] delete failed : " + JSON.stringify(reason)));
    };

    const pauseUIVC = (name, namespace) => {
        pauseVCluster(ddClient, name, namespace).then(isPaused => {
            if (isPaused) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] pause triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] pause failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] pause failed : " + JSON.stringify(reason)));
    };

    const resumeUIVC = (name, namespace) => {
        resumeVCluster(ddClient, name, namespace).then(isResumed => {
            if (isResumed) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + ":" + name + "] resume triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] resume failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + ":" + name + "] resume failed : " + JSON.stringify(reason)));
    };

    const disconnectUIVC = (namespace, context) => {
        disconnectVCluster(ddClient, namespace, context).then(isDisconnected => {
            if (isDisconnected) {
                ddClient.desktopUI.toast.success("vcluster[" + namespace + "] disconnect triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vcluster[" + namespace + "] disconnect failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vcluster[" + namespace + "] disconnect failed : " + JSON.stringify(reason)));
    };

    const connectUIVC = (name, namespace) => {
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

    return (<>
        <Stack direction="column" spacing={2}>
            {/*<K8sContext containerK8sContext={containerK8sContext}/>*/}
            <hr/>
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
        </Stack>
    </>);
}

export default VCluster;
