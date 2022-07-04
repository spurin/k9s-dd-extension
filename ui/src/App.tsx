import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {DockerMuiThemeProvider} from "@docker/docker-mui-theme";
import {VCluster} from "./vcluster/Vcluster";
import Logo from "./images/vcluster_horizontal_black.svg";
import {Box, Stack} from "@mui/material";

export const App = () => {
    return (<DockerMuiThemeProvider>
        <CssBaseline/>
        <Stack direction="column" spacing={2}>
            <Box
                component="img"
                sx={{
                    alignSelf: "center",
                    height: 100,
                    width: 300,
                    marginTop: "20px",
                    marginBottom: "20px",
                    maxHeight: {xs: 150, md: 350},
                    maxWidth: {xs: 150, md: 350},
                }}
                src={Logo}/>
        </Stack>
        <VCluster/>
    </DockerMuiThemeProvider>);
}