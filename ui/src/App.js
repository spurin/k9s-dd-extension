import React, {useEffect} from "react";
import Button from "@mui/material/Button";
import CssBaseline from '@mui/material/CssBaseline';
import {DockerMuiThemeProvider} from '@docker/docker-mui-theme';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "./App.css";
import {isK8sConnectionActive, listVClusters} from "./client/docker-client";
import VClusterList from "./vcluster/list";

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

function App() {
    const [vClusters, setVClusters] = React.useState([]);
    const ddClient = useDockerDesktopClient();

    useEffect(() => {
        isK8sConnectionActive(ddClient)
            .then(isAlive => {
                if (isAlive) {
                    listVClusters(ddClient)
                        .then(value => setVClusters(value))
                        .catch(reason => console.log(reason))
                }
            })
            .catch(reason => console.log(reason))
    }, []);

    const resetK8sConnection = async () => {
        await resetK8sConnection(ddClient)
    }

    const createVCluster = async () => {
        // if (!await isLoftToolKitVolumeCreated(ddClient)) {
        //     await createVolume(ddClient);
        // }
        // if (!await isLoftToolKitPodCreated(ddClient)) {
        //     await createLoftToolKitContainer(ddClient);
        // }
        // await isLoftToolKitPodRunning(ddClient)
        // await isLoftToolKitVolumeAttached(ddClient)
        // const result = await ddClient.extension.vm.service.get("/hello");
        // console.log(result)
    };

    return (<DockerMuiThemeProvider>
        <CssBaseline/>
        <div className="App">
            <Button variant="contained" onClick={createVCluster}>
                Create vCluster
            </Button>
            <Button variant="contained" onClick={createVCluster}>
                Disconnect K8s Cluster
            </Button>
            <hr/>
            <VClusterList vClusters={vClusters}></VClusterList>
        </div>
    </DockerMuiThemeProvider>);
}

export default App;
