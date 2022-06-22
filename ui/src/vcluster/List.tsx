import * as React from 'react';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import Button from "@mui/material/Button";
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';

import {ID_NAMESPACE_SEPARATOR} from "../helper/constants";
import {Stack} from "@mui/material";
import {convertSeconds, getVClusterContextName} from "../helper/util";

type Props = {
    vClusters: undefined,
    currentK8sContext: string,
    pauseUIVC: (name: string, namespace: string) => void
    resumeUIVC: (name: string, namespace: string) => void
    deleteUIVC: (name: string, namespace: string) => void,
    connectUIVC: (name: string, namespace: string) => void,
    disconnectUIVC: (namespace: string, context: string) => void,
};

export const VClusterList = (props: Props) => {

    const getPauseResumeButtons = (name: string, namespace: string, status: string) => {
        if (status === "Paused") {
            return <Button
                variant="contained"
                onClick={() => handleResume(name, namespace, status)}
                startIcon={<PlayArrowIcon/>}
                color="success"
                type="submit">
                Resume
            </Button>
        } else {
            return <Button
                variant="contained"
                onClick={() => handlePause(name, namespace, status)}
                startIcon={<PauseIcon/>}
                color="warning"
                type="submit">
                Pause
            </Button>
        }
    }

    const getConnectDisconnectButtons = (name: string, namespace: string, status: string, context: string) => {
        if (isConnected(name, namespace, context)) {
            return <Button
                variant="contained"
                onClick={() => handleDisconnect(name, namespace, context)}
                startIcon={<CloudOffIcon/>}
                color="warning"
                type="submit">
                Disconnect
            </Button>
        } else {
            return <Button
                variant="contained"
                onClick={() => handleConnect(name, namespace, status)}
                startIcon={<CloudIcon/>}
                color="success"
                disabled={status !== 'Running'}
                type="submit">
                Connect
            </Button>
        }
    }

    const isConnected = (name: string, namespace: string, context: string) => {
        return props.currentK8sContext === getVClusterContextName(name, namespace, context)
    }

    const columns: GridColDef[] = [{
        field: 'Name', headerName: 'Name', flex: 1, headerAlign: 'left',
    }, {
        field: 'Status', headerName: 'Status', width: 150, headerAlign: 'left',
    }, {
        field: 'Namespace', headerName: 'Namespace', width: 150, headerAlign: 'left',
    }, {
        field: 'Age',
        headerName: 'Age',
        type: 'number',
        width: 100,
        headerAlign: 'left',
        renderCell: (vCluster) => (<>
            {convertSeconds(vCluster.row.Created)}
        </>)
    }, {
        field: "action",
        headerName: "Action",
        width: 400,
        renderCell: (vCluster) => (<Stack direction="row" spacing={1}>
            {getPauseResumeButtons(vCluster.row.Name, vCluster.row.Namespace, vCluster.row.Status)}
            <Button
                onClick={() => handleDelete(vCluster.row.Name, vCluster.row.Namespace)}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon/>}
                type="submit">
                Delete
            </Button>
            {getConnectDisconnectButtons(vCluster.row.Name, vCluster.row.Namespace, vCluster.row.Status, vCluster.row.Context)}
        </Stack>)
    }];

    const handleDelete = (name: string, namespace: string) => {
        props.deleteUIVC(name, namespace)
    };

    const handlePause = (name: string, namespace: string, status: string) => {
        if (status !== 'Paused') {
            props.pauseUIVC(name, namespace)
        }
    };

    const handleConnect = (name: string, namespace: string, status: string) => {
        if (status === 'Running') {
            props.connectUIVC(name, namespace)
        }
    };

    const handleDisconnect = (name: string, namespace: string, context: string) => {
        props.disconnectUIVC(namespace, getVClusterContextName(name, namespace, context))
    };

    const handleResume = (name: string, namespace: string, status: string) => {
        if (status === 'Paused') {
            props.resumeUIVC(name, namespace)
        }
    };

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
            loading={!props.vClusters}
            getRowId={(row) => row.Name + ID_NAMESPACE_SEPARATOR + row.Namespace}
            rows={props.vClusters || []}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection={false}
            disableSelectionOnClick={true}
        />
    </div>);
}
