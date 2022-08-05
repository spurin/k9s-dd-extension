import React, {useEffect} from "react";
import {createDockerDesktopClient} from '@docker/extension-api-client';
import "../App.css";
import ErrorIcon from '@mui/icons-material/Error';
import {
    getCurrentK8sContext,
    updateDockerDesktopK8sKubeConfig
} from "../helper/cli";
import {Alert, Box, CircularProgress, Stack} from "@mui/material";
import Typography from '@mui/material/Typography';
import {blueGrey} from "@mui/material/colors";

const ddClient = createDockerDesktopClient();

const refreshContext = async (isDDK8sEnabled: boolean, setIsDDK8sEnabled: React.Dispatch<React.SetStateAction<any>>) => {
    if (!isDDK8sEnabled) {
        try {
            let isDDK8sEnabled = await updateDockerDesktopK8sKubeConfig(ddClient);
            console.log("isDDK8sEnabled[interval] : ", isDDK8sEnabled)
            setIsDDK8sEnabled(isDDK8sEnabled)
        } catch (err) {
            console.log("isDDK8sEnabled[interval] error : ", JSON.stringify(err));
            setIsDDK8sEnabled(false);
        }
    } else {
        console.log("isDDK8sEnabled[interval] : ", isDDK8sEnabled)
    }
}

const checkIfDDK8sEnabled = async (setIsLoading: React.Dispatch<React.SetStateAction<any>>) => {
    try {
        setIsLoading(true);
        let isDDK8sEnabled = await updateDockerDesktopK8sKubeConfig(ddClient);
        setIsLoading(false);
        return isDDK8sEnabled
    } catch (err) {
        console.log("checkIfDDK8sEnabled error : ", JSON.stringify(err));
        setIsLoading(false);
    }
    return false;
}

export const K8S = () => {
    const [isDDK8sEnabled, setIsDDK8sEnabled] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    useEffect(() => {
        (async () => {
            let isDDK8sEnabled = await checkIfDDK8sEnabled(setIsLoading);
            console.log("isDDK8sEnabled : ", isDDK8sEnabled)
            await setIsDDK8sEnabled(isDDK8sEnabled)
        })();
        const contextInterval = setInterval(() => refreshContext(isDDK8sEnabled, setIsDDK8sEnabled), 5000);
        const dataInterval = setInterval(() => {
        }, 5000);
        return () => {
            clearInterval(dataInterval);
            clearInterval(contextInterval);
        }
    }, [isDDK8sEnabled]);

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
            const myHTML = '<style>:root { --dd-spacing-unit: 0px; }</style><iframe src="http://localhost:35781" frameborder="0" style="overflow:hidden;height:99vh;width:100%" height="100%" width="100%"></iframe>';
            component = <React.Fragment>
            <div dangerouslySetInnerHTML={{ __html: myHTML }} />
            </React.Fragment>
        } else {
            component = <Box>
                <Alert iconMapping={{
                    error: <ErrorIcon fontSize="inherit"/>,
                }} severity="error" color="error">
                    Seems like Kubernetes is not enabled in your Docker Desktop. Please take a look at the <a
                    href="https://docs.docker.com/desktop/kubernetes/">docker
                    documentation</a> on how to enable the Kubernetes server.
                </Alert>
            </Box>
        }
    }
    return <Stack direction="column" spacing={2}>
        {component}
    </Stack>;
}
