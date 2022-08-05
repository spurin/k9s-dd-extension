import React from "react";
import {DockerMuiThemeProvider} from "@docker/docker-mui-theme";
import {K8S} from "./k8s/K8S";

export const App = () => {
    return (<DockerMuiThemeProvider>
        <K8S/>
    </DockerMuiThemeProvider>);
}
