import React, {useEffect} from "react";
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "../App.css";
import {
    createVCluster,
    deleteVCluster,
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

    const ddClient = useDockerDesktopClient();

    useEffect(() => {
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

    const createUIVC = async (name, namespace) => {
        const isCreated = await createVCluster(ddClient, name, namespace);
        if (isCreated) {
            ddClient.desktopUI.toast.success("vCluster create triggered successfully");
        } else {
            ddClient.desktopUI.toast.error("vCluster create failed");
        }
    };

    const deleteUIVC = async (name, namespace) => {
        const isDeleted = await deleteVCluster(ddClient, name, namespace);
        if (isDeleted) {
            ddClient.desktopUI.toast.success("vCluster delete triggered successfully");
        } else {
            ddClient.desktopUI.toast.error("vCluster delete failed");
        }
    };

    const listUIVCs = async () => {
        const vClusters = await listVClusters(ddClient);
        await setVClusters(vClusters)
    };

    const listUINSs = async () => {
        const namespaces = await listNamespaces(ddClient);
        await setNamespaces(namespaces)
    };

    const pauseUIVC = async (name, namespace) => {
        const isPaused = await pauseVCluster(ddClient, name, namespace);
        if (isPaused) {
            ddClient.desktopUI.toast.success("vCluster pause triggered successfully");
        } else {
            ddClient.desktopUI.toast.error("vCluster pause failed");
        }
    };

    const resumeUIVC = async (name, namespace) => {
        const isResumed = await resumeVCluster(ddClient, name, namespace);
        if (isResumed) {
            ddClient.desktopUI.toast.success("vCluster resume triggered successfully");
        } else {
            ddClient.desktopUI.toast.error("vCluster resume failed");
        }
    };
    return (<>
        <Stack direction="column" spacing={2}>
            <VClusterCreate
                createUIVC={createUIVC}
                listUINSs={listUINSs}
                namespaces={namespaces}/>
            <VClusterList
                listUIVCs={listUIVCs}
                deleteUIVC={deleteUIVC}
                pauseUIVC={pauseUIVC}
                resumeUIVC={resumeUIVC}
                vClusters={vClusters}
            />
        </Stack>
    </>);
}

export default VCluster;
