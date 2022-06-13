import * as React from 'react';
import {DataGrid, GridColDef} from '@mui/x-data-grid';

const columns: GridColDef[] = [
    {
        field: 'Name',
        headerName: 'Name',
        width: 150,
    },
    {
        field: 'Namespace',
        headerName: 'Namespace',
        width: 150,
    },
    {
        field: 'Created',
        headerName: 'Creation Time',
        width: 150,
    },
    {
        field: 'AgeSeconds',
        headerName: 'Age Seconds',
        type: 'number',
        width: 150,
    },
    {
        field: 'Status',
        headerName: 'Status',
        width: 150,
    },
];

export default function VClusterList(props) {
    return (
        <div style={{display: 'flex', height: 400, width: '100%'}}>
            <DataGrid
                loading={props.vClusters.length === 0}
                getRowId={(row) => row.Name + row.Namespace}
                rows={props.vClusters}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableSelectionOnClick
            />
        </div>
    );
}
