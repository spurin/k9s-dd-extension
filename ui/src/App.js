import React from "react";
import Button from "@mui/material/Button";
import CssBaseline from '@mui/material/CssBaseline';
import {DockerMuiThemeProvider} from '@docker/docker-mui-theme';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "./App.css";
import {createLoftToolKitContainer, createVolume} from "./docker-client";

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

function App() {
    const [response, setResponse] = React.useState("");
    const ddClient = useDockerDesktopClient();

    const get = async () => {
        await createVolume(ddClient);
        await createLoftToolKitContainer(ddClient);
        const result1 = await ddClient.extension.vm.service.get("/hello");
        console.log(result1)
        setResponse(JSON.stringify(result1));
    };

    // const createVCluster = async () => {
    //     const result = await ddClient.extension.vm.service.post("/vClusters");
    //     setResponse(JSON.stringify(result));
    // };
    //
    // const deleteVCluster = async () => {
    //     const result = await ddClient.extension.vm.service.delete("/vcluster/cluster-1");
    //     setResponse(JSON.stringify(result));
    // };

    return (<DockerMuiThemeProvider>
        <CssBaseline/>
        <div className="App">
            <Button variant="contained" onClick={get}>
                Call backend
            </Button>
            {/*<Button variant="contained" onClick={createVCluster}>*/}
            {/*    Create vCluster*/}
            {/*</Button>*/}
            {/*<Button variant="contained" onClick={deleteVCluster}>*/}
            {/*    Delete vCluster*/}
            {/*</Button>*/}
            <pre>{response}</pre>
        </div>
    </DockerMuiThemeProvider>);
}

export default App;
