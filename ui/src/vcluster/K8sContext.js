import React from "react";
import {Box, Stack, Typography} from "@mui/material";

export default function K8sContext(props) {
    let ClusterComponent = <Typography variant="h6" gutterBottom component="div">
        Cluster : {props.containerK8sContext?.context?.cluster}
    </Typography>;
    let UserComponent = <Typography variant="h6" gutterBottom component="div">
        User : {props.containerK8sContext?.context?.user}
    </Typography>;
    let ContextComponent = <Typography variant="h6" gutterBottom component="div">
        Context : {props.containerK8sContext?.name}
    </Typography>
    return <Box sx={{boxShadow: 2, alignSelf: "center", padding: "10px"}}>
        <Stack direction="row" spacing={2}>
            {ClusterComponent}
            {UserComponent}
            {ContextComponent}
        </Stack>
    </Box>
}