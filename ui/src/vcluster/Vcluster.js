import React, {useEffect} from "react";
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "../App.css";
import {
    createVCluster,
    deleteVCluster,
    getK8sContext,
    listNamespaces,
    listVClusters,
    pauseVCluster,
    resumeVCluster
} from "../helper/cli";
import VClusterList from "../vcluster/List";
import VClusterCreate from "../vcluster/Create";
import {Stack} from "@mui/material";
import K8sContext from "./K8sContext";

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

const VCluster = () => {
    const [vClusters, setVClusters] = React.useState([]);
    const [namespaces, setNamespaces] = React.useState([]);
    const [k8sContext, setK8sContext] = React.useState([]);

    const ddClient = useDockerDesktopClient();

    useEffect(() => {
        getK8sContext(ddClient).then(k8sContext => {
            console.log(k8sContext)
            setK8sContext(k8sContext)
        }).catch(reason => {
            console.log(reason);
            setK8sContext({})
        });
        const interval = setInterval(() => {
            listVClusters(ddClient)
                .then(value => setVClusters(value))
                .catch(reason => console.log(reason))
            listNamespaces(ddClient)
                .then(value => setNamespaces(value))
                .catch(reason => console.log(reason))
        }, 5000);
        return () => clearInterval(interval);
    }, [ddClient]);

    const createUIVC = (name, namespace) => {
        createVCluster(ddClient, name, namespace).then(isCreated => {
            if (isCreated) {
                ddClient.desktopUI.toast.success("vCluster[" + namespace + ":" + name + "] create triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vCluster[" + namespace + ":" + name + "] create failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vCluster[" + namespace + ":" + name + "] create failed : " + reason));
    };

    const deleteUIVC = async (name, namespace) => {
        deleteVCluster(ddClient, name, namespace).then(isDeleted => {
            if (isDeleted) {
                ddClient.desktopUI.toast.success("vCluster[" + namespace + ":" + name + "] delete triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vCluster[" + namespace + ":" + name + "] delete failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vCluster[" + namespace + ":" + name + "] delete failed : " + reason));
    };

    const pauseUIVC = async (name, namespace) => {
        pauseVCluster(ddClient, name, namespace).then(isPaused => {
            if (isPaused) {
                ddClient.desktopUI.toast.success("vCluster[" + namespace + ":" + name + "] pause triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vCluster[" + namespace + ":" + name + "] pause failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vCluster[" + namespace + ":" + name + "] pause failed : " + reason));
    };

    const resumeUIVC = async (name, namespace) => {
        resumeVCluster(ddClient, name, namespace).then(isResumed => {
            if (isResumed) {
                ddClient.desktopUI.toast.success("vCluster[" + namespace + ":" + name + "] resume triggered successfully");
            } else {
                ddClient.desktopUI.toast.error("vCluster[" + namespace + ":" + name + "] resume failed");
            }
        }).catch(reason => ddClient.desktopUI.toast.error("vCluster[" + namespace + ":" + name + "] resume failed : " + reason));
    };

    return (<>
        <Stack direction="column" spacing={2}>
            <K8sContext k8sContext={k8sContext}/>
            <hr/>
            <VClusterCreate
                createUIVC={createUIVC}
                namespaces={namespaces}/>
            <VClusterList
                deleteUIVC={deleteUIVC}
                pauseUIVC={pauseUIVC}
                resumeUIVC={resumeUIVC}
                vClusters={vClusters}
            />
        </Stack>
    </>);
}

export default VCluster;
