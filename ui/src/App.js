import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {DockerMuiThemeProvider} from "@docker/docker-mui-theme";
import VCluster from "./vcluster/Vcluster";

export default function App() {
    const [show, setShow] = React.useState(false);
    return (<DockerMuiThemeProvider>
        <CssBaseline/>

        <VCluster/>
    </DockerMuiThemeProvider>);
}