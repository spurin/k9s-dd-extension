import * as React from 'react';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';

import {ID_NAMESPACE_SEPARATOR} from "../helper/constants";
import {Stack} from "@mui/material";
import {convertSeconds, getVClusterContextName} from "../helper/util";
import AsyncButton from './AsyncButton/AsyncButton';

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
            return <AsyncButton
                variant="contained"
                onClickAsync={async () => await handleResume(name, namespace, status)}
                startIcon={<PlayArrowIcon/>}
                color="success">
                Resume
            </AsyncButton>
        } else {
            return <AsyncButton
                variant="contained"
                onClickAsync={async () => await handlePause(name, namespace, status)}
                startIcon={<PauseIcon/>}
                color="warning">
                Pause
            </AsyncButton>
        }
    }

    const getConnectDisconnectButtons = (name: string, namespace: string, status: string, context: string) => {
        if (isConnected(name, namespace, context)) {
            return <AsyncButton
                variant="contained"
                onClickAsync={async () =>
                    await handleDisconnect(name, namespace, context)
                }
                startIcon={<CloudOffIcon/>}
                color="warning">
                Disconnect
            </AsyncButton>
        } else {
            return <AsyncButton
                onClickAsync={async () => {
                    await handleConnect(name, namespace, status)
                }}
                variant="contained"
                startIcon={<CloudIcon/>}
                color="success"
                disabled={status !== 'Running'}>
                Connect
            </AsyncButton>
        }
    }

    const isConnected = (name: string, namespace: string, context: string) => {
        return props.currentK8sContext === getVClusterContextName(name, namespace, context);
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
            <AsyncButton
                onClickAsync={async () => await handleDelete(vCluster.row.Name, vCluster.row.Namespace)}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon/>}>
                Delete
            </AsyncButton>
            {getConnectDisconnectButtons(vCluster.row.Name, vCluster.row.Namespace, vCluster.row.Status, vCluster.row.Context)}
        </Stack>)
    }];

    const handleDelete = async (name: string, namespace: string) => {
        await props.deleteUIVC(name, namespace);
    };

    const handlePause = async (name: string, namespace: string, status: string) => {
        if (status !== 'Paused') {
            await props.pauseUIVC(name, namespace);
        }
    };

    const handleConnect = async (name: string, namespace: string, status: string) => {
        if (status === 'Running') {
            await props.connectUIVC(name, namespace);
        }
    };

    const handleDisconnect = async (name: string, namespace: string, context: string) => {
        await props.disconnectUIVC(namespace, getVClusterContextName(name, namespace, context))
    };

    const handleResume = async (name: string, namespace: string, status: string) => {
        if (status === 'Paused') {
            await props.resumeUIVC(name, namespace);
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
