import Button from "@mui/material/Button";
import React from "react";
import CreateIcon from '@mui/icons-material/Create';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    Stack,
    TextField
} from "@mui/material";

export default function VClusterCreate(props) {
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [namespace, setNamespace] = React.useState("");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (event) => {
        setNamespace(event.target.value);
    };

    const createUIVC = (e) => {
        e.preventDefault();
        if (!name) {
            handleClickOpen()
            return;
        }
        if (!namespace) {
            handleClickOpen()
            return;
        }
        props.createUIVC(name, namespace).then(value => console.log(value))
            .catch(reason => console.log(reason))
        handleClose()
    };

    return <Stack direction="row" spacing={2}>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title">
            <DialogTitle sx={{m: 0, p: 2}} id="form-dialog-title">
                <DialogContentText align={"center"}>
                    Create new vcluster
                </DialogContentText>
            </DialogTitle>
            <form noValidate onSubmit={createUIVC}>
                <DialogContent>
                    <Stack direction="column" spacing={2}>
                        <TextField
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoFocus
                            variant="filled"
                            margin="dense"
                            id="name"
                            label="Name"
                            type="text"
                            size="medium"
                            fullWidth
                            required/>
                        <TextField
                            id="outlined-select-namespace"
                            select
                            label="Namespace"
                            size="medium"
                            value={namespace}
                            onChange={handleChange}
                            variant="filled">
                            {props.namespaces.map((namespace) => (
                                <MenuItem key={namespace} value={namespace}>
                                    {namespace}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="error" variant="contained">
                        Cancel
                    </Button>
                    <Button onClick={handleClose} color="primary" variant="contained" type="submit">
                        Create
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
        <Button variant="contained" onClick={handleClickOpen}
                startIcon={<CreateIcon/>}>
            Create new vcluster
        </Button>
    </Stack>
}