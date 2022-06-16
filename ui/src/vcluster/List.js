import * as React from 'react';
import {DataGrid} from '@mui/x-data-grid';
import Button from "@mui/material/Button";
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';

import {ID_NAMESPACE_SEPARATOR} from "../constants";
import {Stack} from "@mui/material";

export default function VClusterList(props) {
    const getPauseResumeButtons = (vCluster) => {
        if (vCluster.row.Status === "Paused") {
            return <Button
                variant="contained"
                onClick={() => handleResume(vCluster)}
                startIcon={<PlayArrowIcon/>}
                color="success"
                type="submit">
                Resume
            </Button>
        } else {
            return <Button
                variant="contained"
                onClick={() => handlePause(vCluster)}
                startIcon={<PauseIcon/>}
                color="warning"
                type="submit">
                Pause &nbsp;&nbsp;&nbsp;
            </Button>
        }
    }

    const getConnectDisconnectButtons = (vCluster) => {
        if (isConnected(vCluster.row.Name, vCluster.row.Namespace, vCluster.row.Context)) {
            return <Button
                variant="contained"
                onClick={() => handleDisconnect(vCluster)}
                startIcon={<CloudOffIcon/>}
                color="warning"
                type="submit">
                Disconnect &nbsp;&nbsp;&nbsp;
            </Button>
        } else {
            return <Button
                variant="contained"
                onClick={() => handleConnect(vCluster)}
                startIcon={<CloudIcon/>}
                color="success"
                type="submit">
                Connect
            </Button>
        }
    }

    const isConnected = (name, namespace, context) => {
        return props.currentK8sContext === getVClusterContextName(name, namespace, context)
    }

    const getVClusterContextName = (name, namespace, context) => {
        return "vcluster_" + name + "_" + namespace + "_" + context
    }

    const columns = [{
        field: 'Name', headerName: 'Name', width: 150, headerAlign: 'left',
    }, {
        field: 'Namespace', headerName: 'Namespace', width: 150, headerAlign: 'left',
    }, {
        field: 'Status', headerName: 'Status', width: 150, headerAlign: 'left',
    }, {
        field: 'Age', headerName: 'Age', type: 'number', width: 150, headerAlign: 'left', renderCell: (vCluster) => (<>
            {convertSeconds(vCluster.row.Created)}
        </>)
    }, {
        field: "action",
        headerName: "Action",
        width: 450,
        renderCell: (vCluster) => (<Stack direction="row" spacing={1}>
            {getPauseResumeButtons(vCluster)}
            <Button
                onClick={() => handleDelete(vCluster)}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon/>}
                type="submit">
                Delete
            </Button>
            {getConnectDisconnectButtons(vCluster)}
        </Stack>)
    }];

    const handleDelete = (clickedVCluster) => {
        props.deleteUIVC(clickedVCluster.row.Name, clickedVCluster.row.Namespace)
    };

    const handlePause = (clickedVCluster) => {
        if (clickedVCluster.row.Status !== 'Paused') {
            props.pauseUIVC(clickedVCluster.row.Name, clickedVCluster.row.Namespace)
        }
    };

    const handleConnect = (clickedVCluster) => {
        props.connectUIVC(clickedVCluster.row.Name, clickedVCluster.row.Namespace)
    };

    const handleDisconnect = (clickedVCluster) => {
        props.disconnectUIVC(clickedVCluster.row.Namespace, getVClusterContextName(clickedVCluster.row.Name, clickedVCluster.row.Namespace, clickedVCluster.row.Context))
    };

    const handleResume = (clickedVCluster) => {
        if (clickedVCluster.row.Status === 'Paused') {
            props.resumeUIVC(clickedVCluster.row.Name, clickedVCluster.row.Namespace)
        }
    };

    const convertSeconds = function (date) {
        if (date) {
            let seconds = Math.floor((new Date() - new Date(date)) / 1000);
            const SECONDS_PER_DAY = 86400;
            const HOURS_PER_DAY = 24;
            const days = Math.floor(seconds / SECONDS_PER_DAY);
            const remainderSeconds = seconds % SECONDS_PER_DAY;
            const hms = new Date(remainderSeconds * 1000).toISOString().substring(11, 19);
            const replaced = hms.replace(/^(\d+)/, h => `${Number(h) + days * HOURS_PER_DAY}`.padStart(2, '0'));
            const strings = replaced.split(":");
            let output = ""
            output += parseInt(strings[0]) > 0 ? parseInt(strings[0]) + "h" : ""
            output += parseInt(strings[1]) > 0 ? parseInt(strings[1]) + "m" : ""
            output += parseInt(strings[2]) > 0 ? parseInt(strings[2]) + "s" : ""
            return output
        }
        return ""
    }

    return (<div style={{display: 'flex', height: 400, width: '100%'}}>
        <DataGrid
            sx={{
                padding: "10px",
                boxShadow: 4,
                border: 4,
                borderColor: 'primary.light',
                '.MuiDataGrid-columnSeparator': {
                    display: 'none',
                },
                '&.MuiDataGrid-root': {
                    border: 'none',
                },
            }}
            loading={props.vClusters.length === 0}
            getRowId={(row) => row.Name + ID_NAMESPACE_SEPARATOR + row.Namespace}
            rows={props.vClusters}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection={false}
            disableSelectionOnClick={true}
        />

    </div>);
}
