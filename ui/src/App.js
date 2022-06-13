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
        await ddClient.docker.cli.exec("volume", ["create", "loft-toolkit"], {
            stream: {
                onOutput(data) {
                    if (data.stdout) {
                        console.log("[volume created] : ", data.stdout);
                    } else {
                        console.error("[volume creation failed] : ", data.stderr);
                    }
                }, onError(error) {
                    console.error("[volume creation failed] : ", error);
                },
            },
        });
    }

    async function createLoftToolKitContainer() {
        await ddClient.docker.cli.exec("run", ["-d", "--name", "loft-toolkit", "-v", "loft-toolkit:/root/.kube", "loft-toolkit:0.0.2"], {
            stream: {
                onOutput(data) {
                    if (data.stdout) {
                        console.log("[container created] : ", data.stdout);
                    } else {
                        console.error("[container creation failed] : ", data.stderr);
                    }
                }, onError(error) {
                    console.error("[container creation failed] : ", error);
                }
            },
        });
    }

    async function resetK8sConnection() {
        await deleteLoftToolKitContainer()
        await deleteLoftToolKitVolume()
    }

    async function isLoftToolKitPodRunning() {
        return true
    }

    async function isLoftToolKitVolumeAttached() {
        return true
    }

    async function isK8sConnectionActive() {
        return await isLoftToolKitPodRunning() && await isLoftToolKitVolumeAttached()
    }

    async function deleteLoftToolKitVolume() {
        await ddClient.docker.cli.exec("volume", ["rm", "loft-toolkit", "-f"], {
            stream: {
                onOutput(data) {
                    if (data.stdout) {
                        console.log("[volume deleted] : ", data.stdout);
                    } else {
                        console.error("[volume deletion failed] : ", data.stderr);
                    }
                }, onError(error) {
                    console.error("[volume deletion failed] : ", error);
                }
            },
        });
    }

    async function deleteLoftToolKitContainer() {
        await ddClient.docker.cli.exec("container", ["rm", "loft-toolkit", "-f"], {
            stream: {
                onOutput(data) {
                    if (data.stdout) {
                        console.log("[container deleted] : ", data.stdout);
                    } else {
                        console.error("[container deletion failed] : ", data.stderr);
                    }
                }, onError(error) {
                    console.error("[container deletion failed] : ", error);
                }
            },
        });
    }

    const get = async () => {
        await createVolume();
        await createLoftToolKitContainer();
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
