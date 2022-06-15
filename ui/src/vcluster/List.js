import * as React from 'react';
import {DataGrid} from '@mui/x-data-grid';
import Button from "@mui/material/Button";
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import {ID_NAMESPACE_SEPARATOR} from "../constants";
import {Stack} from "@mui/material";

export default function VClusterList(props) {
    function getButton(vCluster) {
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

    const columns = [{
        field: 'Name', headerName: 'Name', width: 150, headerAlign: 'left',
    }, {
        field: 'Namespace', headerName: 'Namespace', width: 150, headerAlign: 'left',
    }, {
        field: 'Created', headerName: 'Creation Time', width: 150, headerAlign: 'left',
    }, {
        field: 'AgeSeconds', headerName: 'Age Seconds', type: 'number', width: 150, headerAlign: 'left',
    }, {
        field: 'Status', headerName: 'Status', width: 150, headerAlign: 'left',
    }, {
        field: "action",
        headerName: "Action",
        width: 250,
        renderCell: (vCluster) => (<Stack direction="row" spacing={2}>
            {getButton(vCluster)}
            <Button
                onClick={() => handleDelete(vCluster)}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon/>}
                type="submit">
                Delete
            </Button>
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

    const handleResume = (clickedVCluster) => {
        if (clickedVCluster.row.Status === 'Paused') {
            props.resumeUIVC(clickedVCluster.row.Name, clickedVCluster.row.Namespace)
        }
    };

    return (<div style={{display: 'flex', height: 400, width: '100%'}}>
        <DataGrid
            sx={{
                boxShadow: 4, border: 4, borderColor: 'primary.light', '.MuiDataGrid-columnSeparator': {
                    display: 'none',
                }, '&.MuiDataGrid-root': {
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
