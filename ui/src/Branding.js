import React from "react";
import {Box, Stack, Typography} from "@mui/material";
import Button from "@mui/material/Button";

export default function Branding() {
    return <Stack direction="column" spacing={1}>
        <Box
            component="img"
            sx={{
                alignSelf: "center",
                height: 233,
                width: 350,
                maxHeight: {xs: 233, md: 167},
                maxWidth: {xs: 350, md: 250},
            }}
            src="https://d33wubrfki0l68.cloudfront.net/0ba1c19e054b699c5642c768cdb3145123611f8b/0d4b0/images/vcluster-logo.svg"
        />
        <Typography paragraph={true} gutterBottom component="div" align="justify">
            Virtual clusters run inside namespaces of other clusters. They have a separate API server and a
            separate data store, so every Kubernetes object you create in the vcluster only exists inside the
            vcluster.
            It also makes them much more powerful and better isolated than namespaces, but they are also much
            cheaper than creating separate "real" Kubernetes clusters.
        </Typography>
        <Box
            component="span"
            sx={{
                alignSelf: "center",
                height: 233,
                width: "100%",
                maxHeight: {xs: 233, md: 167},
                maxWidth: {xs: 350, md: 250},
            }}>
            <Stack direction="row" spacing={2}>
                <Button color="primary" variant="text">
                    Want to know more about vclusters?
                </Button>
                <Button color="primary" variant="contained" type="submit">
                    Create vclusters
                </Button>
            </Stack>
        </Box>
    </Stack>
}