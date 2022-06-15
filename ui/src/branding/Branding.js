import React from "react";
import {Box, Stack, Typography} from "@mui/material";
import Button from "@mui/material/Button";

export default function Branding(props) {
    return <Stack direction="column" spacing={2}>
        <Typography variant={"h5"} gutterBottom component="div" align="justify">
            <a href={"https://www.vcluster.com/docs/what-are-virtual-clusters"}>Virtual clusters</a> run inside
            namespaces of other clusters. They have a separate API server and a
            separate data store, so every Kubernetes object you create in the vcluster only exists inside the
            vcluster.
            It also makes them much more powerful and better isolated than namespaces, but they are also much
            cheaper than creating separate "real" Kubernetes clusters.
        </Typography>
        <Box
            component="span"
            sx={{
                alignSelf: "center",
                height: 70,
                width: "100%",
                maxHeight: {xs: 350, md: 450},
                maxWidth: {xs: 350, md: 450},
            }}>
            <Stack direction="row" spacing={2}>
                <Button color="primary" variant="text" href="https://www.vcluster.com/docs/architecture/basics">
                    Want to know more about vclusters?
                </Button>
                <Button color="primary" variant="contained" onClick={props.handleClickCreateVC}>
                    Manage vclusters
                </Button>
            </Stack>
        </Box>
        <Box
            component="span"
            sx={{
                alignSelf: "center",
                height: 300,
                width: "100%",
                maxHeight: {xs: 350, md: 450},
                maxWidth: {xs: 350, md: 450},
            }}>
            <iframe width="350" height="250" src="https://www.youtube.com/embed/J7OQic9M-9w"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen></iframe>
        </Box>
    </Stack>
}