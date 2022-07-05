import * as React from 'react';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';
import UpgradeIcon from '@mui/icons-material/Upgrade';

import {ID_NAMESPACE_SEPARATOR} from "../helper/constants";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fab,
    Stack,
    TextareaAutosize,
    TextField,
    Tooltip
} from "@mui/material";
import {convertSeconds, getVClusterContextName} from "../helper/util";
import {AsyncButton} from './AsyncButton/AsyncButton';

type Props = {
    vClusters: undefined,
    currentK8sContext: string,
    pauseUIVC: (name: string, namespace: string) => void
    resumeUIVC: (name: string, namespace: string) => void
    deleteUIVC: (name: string, namespace: string) => void,
    upgradeUIVC: (name: string, namespace: string, chartVersion: string, values: string) => void,
    connectUIVC: (name: string, namespace: string) => void,
    disconnectUIVC: (namespace: string, context: string) => void,
};

export const VClusterList = (props: Props) => {
    const [chartVersion, setChartVersion] = React.useState("");
    const [values, setValues] = React.useState("");
    const [state, setState] = React.useState({
        editOpen: false,
        deleteOpen: false,
        name: "",
        namespace: ""
    });

    let valuesDefault = `# Additional helm values for the virtual cluster
storage:
  size: 5Gi
`
    const handleUpgrade = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        await props.upgradeUIVC(state.name, state.namespace, chartVersion, values);
        setValues("");
        setChartVersion("");
        handleEditClose();
    };

    const handleDelete = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        await props.deleteUIVC(state.name, state.namespace);
        handleDeleteClose();
    };

    const handleEditOpen = (name: string, namespace: string) => {
        setState({
            editOpen: true,
            deleteOpen: false,
            name: name,
            namespace: namespace
        });
    };

    const handleDeleteOpen = (name: string, namespace: string) => {
        setState({
            editOpen: false,
            deleteOpen: true,
            name: name,
            namespace: namespace
        });
    };

    const handleDeleteClose = () => {
        setState({
            ...state,
            editOpen: false,
            deleteOpen: false,
            name: "",
            namespace: ""
        });
    };

    const handleEditClose = () => {
        setState({
            ...state,
            editOpen: false,
            deleteOpen: false,
            name: "",
            namespace: ""
        });
        setValues("")
        setChartVersion("")
    };

    const getUpgradeButton = (name: string, namespace: string) => {
        return <Tooltip title={"Upgrade the virtual cluster"}>
            <span>
                <Fab sx={{
                    boxShadow: 0
                }} size="small" onClick={() => {
                    return handleEditOpen(name, namespace)
                }}>
                    <UpgradeIcon/>
                </Fab>
            </span>
        </Tooltip>;
    }

    const getDeleteButton = (name: string, namespace: string) => {
        return <Tooltip title={"Delete the virtual cluster"}>
           <span>
               <Fab sx={{
                   boxShadow: 0
               }} size="small" onClick={() => {
                   return handleDeleteOpen(name, namespace)
               }}>
                   <DeleteIcon/>
               </Fab>
           </span>
        </Tooltip>;
    }

    const getPauseResumeButtons = (name: string, namespace: string, status: string) => {
        if (status === "Paused") {
            return <AsyncButton
                tooltip={"Start the virtual cluster"}
                onClickAsync={async () => await handleResume(name, namespace, status)}
            >
                <PlayArrowIcon/>
            </AsyncButton>;
        } else {
            return <AsyncButton
                tooltip={"Stop the virtual cluster"}
                onClickAsync={async () => await handlePause(name, namespace, status)}
            >
                <PauseIcon/>
            </AsyncButton>;
        }
    }

    const getConnectDisconnectButtons = (name: string, namespace: string, status: string, context: string) => {
        if (isConnected(name, namespace, context)) {
            return <AsyncButton
                tooltip={"Return to docker-desktop kube context"}
                onClickAsync={async () =>
                    await handleDisconnect(name, namespace, context)
                }>
                <CloudOffIcon/>
            </AsyncButton>;
        } else {
            return <AsyncButton
                onClickAsync={async () => {
                    await handleConnect(name, namespace, status)
                }}
                tooltip={"Switch current kube-context to virtual cluster"}
                disabled={status !== 'Running'}>
                <CloudIcon/>
            </AsyncButton>;
        }
    }

    const isConnected = (name: string, namespace: string, context: string) => {
        return props.currentK8sContext === getVClusterContextName(name, namespace, context);
    }

    const columns: GridColDef[] = [{
        field: 'Name', headerName: 'Name', flex: 1, headerAlign: 'left', align: 'left',

    }, {
        field: 'Status', headerName: 'Status', width: 100, headerAlign: 'left', align: 'left',

    }, {
        field: 'Namespace', headerName: 'Namespace', width: 100, headerAlign: 'left', align: 'left',

    }, {
        field: 'Age',
        headerName: 'Age',
        type: 'number',
        width: 100,
        align: 'left',
        headerAlign: 'left',
        renderCell: (vCluster) => (<>
            {convertSeconds(vCluster.row.Created)}
        </>)
    }, {
        field: "action",
        align: 'left',
        headerAlign: 'left',
        headerName: "Action",
        width: 250,
        renderCell: (vCluster) => (<Stack direction="row" spacing={1} style={{outline: "none"}}>
            {getConnectDisconnectButtons(vCluster.row.Name, vCluster.row.Namespace, vCluster.row.Status, vCluster.row.Context)}
            {getUpgradeButton(vCluster.row.Name, vCluster.row.Namespace)}
            {getPauseResumeButtons(vCluster.row.Name, vCluster.row.Namespace, vCluster.row.Status)}
            {getDeleteButton(vCluster.row.Name, vCluster.row.Namespace)}
        </Stack>)
    }];

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
        <Stack direction="row" spacing={2}>
            <Dialog
                open={state.deleteOpen}
                onClose={handleDeleteClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete vcluster
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        color="#a39796" id="alert-dialog-description">
                        Are you sure to delete <u><i>{state.name}</i></u> cluster
                        from <u><i>{state.namespace}</i></u>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color="warning" onClick={handleDeleteClose}>Cancel</Button>
                    <AsyncButton
                        buttonType="normal"
                        color="error"
                        variant="contained"
                        onClickAsync={async (e) =>
                            await handleDelete(e)
                        }
                        type="submit">
                        Delete
                    </AsyncButton>
                </DialogActions>
            </Dialog>
        </Stack>
        <Stack direction="row" spacing={2}>
            <Dialog
                open={state.editOpen}
                onClose={handleEditClose}
                aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title" align={"left"}>
                    Upgrade vcluster
                </DialogTitle>
                <form noValidate>
                    <DialogContent>
                        <Stack direction="column" spacing={2}>
                            <TextField
                                value={state.name}
                                variant="standard"
                                margin="dense"
                                id="name"
                                label="Name"
                                type="text"
                                size="medium"
                                fullWidth
                                required/>
                            <TextField
                                value={state.namespace}
                                variant="standard"
                                margin="dense"
                                id="namespace"
                                label="Namespace"
                                type="text"
                                size="medium"
                                fullWidth
                                required/>
                            <TextField
                                value={chartVersion}
                                onChange={(event) => setChartVersion(event.target.value)}
                                variant="standard"
                                margin="dense"
                                id="chartVersion"
                                label="Chart Version"
                                type="text"
                                size="medium"
                                fullWidth
                            />
                            <TextareaAutosize
                                value={values}
                                onChange={(event) => setValues(event.target.value)}
                                minRows={10}
                                placeholder={valuesDefault}
                                style={{width: 400}}
                                id="values"/>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditClose} color="warning" variant="outlined">
                            Cancel
                        </Button>
                        <AsyncButton
                            buttonType="normal"
                            color="primary"
                            variant="contained"
                            onClickAsync={async (e) =>
                                await handleUpgrade(e)
                            }
                            disabled={state.name === ""}
                            type="submit">
                            Upgrade
                        </AsyncButton>
                    </DialogActions>
                </form>
            </Dialog>
        </Stack>
        <DataGrid
            sx={{
                padding: "10px",
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
            autoHeight={true}
            rowsPerPageOptions={[5]}
            checkboxSelection={false}
            disableSelectionOnClick={true}
        />
    </div>);
}
