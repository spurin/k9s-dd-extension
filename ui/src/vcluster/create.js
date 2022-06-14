import Button from "@mui/material/Button";
import React from "react";
import CreateIcon from '@mui/icons-material/Create';

export default function VClusterCreate(props) {
    return <Button variant="contained" onClick={props.createUIVC}
                   startIcon={<CreateIcon/>}>
        Create vCluster
    </Button>
}