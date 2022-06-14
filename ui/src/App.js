import React, {useEffect} from "react";
import CssBaseline from '@mui/material/CssBaseline';
import {DockerMuiThemeProvider} from '@docker/docker-mui-theme';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "./App.css";
import {createVCluster, deleteVCluster, listVClusters, pauseVCluster, resumeVCluster} from "./helper/cli";
import VClusterList from "./vcluster/list";
import VClusterCreate from "./vcluster/create";

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

function App() {
    const [vClusters, setVClusters] = React.useState([]);
    const ddClient = useDockerDesktopClient();

    useEffect(() => {
        listVClusters(ddClient)
            .then(value => setVClusters(value))
            .catch(reason => console.log(reason))
        // const interval = setInterval(() => {
        //     listVClusters(ddClient)
        //         .then(value => setVClusters(value))
        //         .catch(reason => console.log(reason))
        // }, 5000);
        // //TODO
        // return () => clearInterval(interval);
    }, [ddClient]);

    const createUIVC = async (name, namespace) => {
        await createVCluster(ddClient, name, namespace);
    };

    const deleteUIVC = async (name, namespace) => {
        await deleteVCluster(ddClient, name, namespace);
    };

    const pauseUIVC = async (name, namespace) => {
        await pauseVCluster(ddClient, name, namespace);
        const vClusters = await listVClusters(ddClient);
        setVClusters(vClusters)
    };

    const resumeUIVC = async (name, namespace) => {
        await resumeVCluster(ddClient, name, namespace);
    };

    return (<DockerMuiThemeProvider>
        <CssBaseline/>
        <div>
            <VClusterCreate/>
            <hr/>
            <VClusterList
                createUIVC={createUIVC}
                deleteUIVC={deleteUIVC}
                pauseUIVC={pauseUIVC}
                resumeUIVC={resumeUIVC}
                vClusters={vClusters}/>
        </div>
    </DockerMuiThemeProvider>);
}

export default App;
