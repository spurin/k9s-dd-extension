import React, {useEffect} from "react";
import CssBaseline from '@mui/material/CssBaseline';
import {DockerMuiThemeProvider} from '@docker/docker-mui-theme';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "./App.css";
import {
    createVCluster,
    deleteVCluster,
    listNamespaces,
    listVClusters,
    pauseVCluster,
    resumeVCluster
} from "./helper/cli";
import VClusterList from "./vcluster/list";
import VClusterCreate from "./vcluster/create";
import {Stack} from "@mui/material";
// import Branding from "./branding";
import Snackbar from "@mui/material/Snackbar";

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
    return client;
}

function App() {
    const [state] = React.useState({
        vertical: 'top',
        horizontal: 'center',
    });
    const [vClusters, setVClusters] = React.useState([]);
    const [namespaces, setNamespaces] = React.useState([]);
    const [opened, setOpened] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const {vertical, horizontal} = state;

    const ddClient = useDockerDesktopClient();

    useEffect(() => {
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
        // }, 5000);
        // //TODO
        // return () => clearInterval(interval);
    }, [ddClient]);

    const createUIVC = async (name, namespace) => {
        const isCreated = await createVCluster(ddClient, name, namespace);
        if (isCreated) {
            showSnackbar({message: "vCluster create triggered successfully"})
        } else {
            showSnackbar({message: "vCluster create failed"})
        }
    };

    const deleteUIVC = async (name, namespace) => {
        const isDeleted = await deleteVCluster(ddClient, name, namespace);
        if (isDeleted) {
            showSnackbar({message: "vCluster delete triggered successfully"})
        } else {
            showSnackbar({message: "vCluster delete failed"})
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
            showSnackbar({message: "vCluster pause triggered successfully"})
        } else {
            showSnackbar({message: "vCluster pause failed"})
        }
    };

    const resumeUIVC = async (name, namespace) => {
        const isResumed = await resumeVCluster(ddClient, name, namespace);
        console.log("isResumed", isResumed)
        if (isResumed) {
            showSnackbar({message: "vCluster resume triggered successfully"})
        } else {
            showSnackbar({message: "vCluster resume failed"})
        }
    };

    const showSnackbar = (object) => {
        setMessage(object.message)
        setOpened(true);
    };

    const hideSnackbar = () => {
        setMessage("")
        setOpened(false);
    };

    return (<DockerMuiThemeProvider>
        <CssBaseline/>
        <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{vertical, horizontal}}
            open={opened}
            onClose={hideSnackbar}
            message={message}
            key={vertical + horizontal}
        />
        <Stack direction="column" spacing={2}>
            {/*<Branding/>*/}
            <VClusterCreate createUIVC={createUIVC}
                            listUINSs={listUINSs}
                            namespaces={namespaces}/>
            <hr/>
            <VClusterList
                listUIVCs={listUIVCs}
                deleteUIVC={deleteUIVC}
                pauseUIVC={pauseUIVC}
                resumeUIVC={resumeUIVC}
                vClusters={vClusters}
            />
        </Stack>
    </DockerMuiThemeProvider>);
}

export default App;
