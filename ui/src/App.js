import React from "react";
import Button from "@mui/material/Button";
import CssBaseline from '@mui/material/CssBaseline';
import {DockerMuiThemeProvider} from '@docker/docker-mui-theme';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "./App.css";

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

function App() {
    const [response, setResponse] = React.useState("");
    const ddClient = useDockerDesktopClient();

    async function createVolume() {
        let execProcess = await ddClient.docker.cli.exec("create", ["-d", "loft-toolkit"], {
            stream: {
                onOutput(data) {
                    if (data.stdout) {
                        console.error(data.stdout);
                    } else {
                        console.log(data.stderr);
                    }
                },
                onError(error) {
                    console.error(error);
                },
                onClose(exitCode) {
                    console.log("onClose with exit code " + exitCode);
                },
                splitOutputLines: true,
            },
        });
        console.log(execProcess)
    }

    async function createLoftToolKitContainer() {
        let execProcess = await ddClient.docker.cli.exec("run", ["-d", "loft-toolkit"], {
            stream: {
                onOutput(data) {
                    if (data.stdout) {
                        console.error(data.stdout);
                    } else {
                        console.log(data.stderr);
                    }
                },
                onError(error) {
                    console.error(error);
                },
                onClose(exitCode) {
                    console.log("onClose with exit code " + exitCode);
                },
                splitOutputLines: true,
            },
        });
        console.log(execProcess)
    }

    const get = async () => {
        await createVolume();
        const result1 = await ddClient.extension.vm.service.get("/hello");
        console.log(result1)
        setResponse(JSON.stringify(result1));
    };

    const createVCluster = async () => {
        const result = await ddClient.extension.vm.service.post("/vClusters");
        setResponse(JSON.stringify(result));
    };
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
