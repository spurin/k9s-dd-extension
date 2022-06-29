import React, {ChangeEvent} from "react";
import CreateIcon from '@mui/icons-material/Create';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    Stack,
    TextareaAutosize,
    TextField
} from "@mui/material";
import AsyncButton from "./AsyncButton/AsyncButton";

type Props = {
    namespaces: string[],
    createUIVC: (name: string, namespace: string, distro: string, chartVersion: string, values: string) => void
};

export const VClusterCreate = (props: Props) => {
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [namespace, setNamespace] = React.useState("");
    const [distro, setDistro] = React.useState("");
    const [chartVersion, setChartVersion] = React.useState("");
    const [values, setValues] = React.useState("");

    let valuesDefault = `# (Optional) Additional helm values
storage:
  size: 5Gi
`
    const distros = ["k0s", "k3s", "k8s"];
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleNamespaceChange = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setNamespace(event.target.value);
    };

    const handleDistroChange = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setDistro(event.target.value);
    };

    const createUIVC = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        await props.createUIVC(name, namespace, distro, chartVersion, values);
        setName("");
        setDistro("");
        setValues("");
        setNamespace("");
        setChartVersion("");
        handleClose();
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
            <form noValidate>
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
                            label="(Optional) Namespace"
                            size="medium"
                            value={namespace}
                            onChange={handleNamespaceChange}
                            variant="filled">
                            <MenuItem value="">
                                <em>Create new</em>
                            </MenuItem>
                            {props.namespaces.map((namespace: string) => (
                                <MenuItem key={namespace} value={namespace}>
                                    {namespace}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            id="outlined-select-distro"
                            select
                            label="(Optional) Distro"
                            size="medium"
                            value={distro}
                            onChange={handleDistroChange}
                            variant="filled">
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {distros.map((distro) => (
                                <MenuItem key={distro} value={distro}>
                                    {distro}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            value={chartVersion}
                            onChange={(event) => setChartVersion(event.target.value)}
                            variant="filled"
                            margin="dense"
                            id="chartVersion"
                            label="(Optional) Chart Version"
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
                    <Button onClick={handleClose} color="error" variant="contained">
                        Cancel
                    </Button>
                    <AsyncButton
                        color="primary"
                        variant="contained"
                        onClickAsync={async (e) =>
                            await createUIVC(e)
                        }
                        disabled={name === ""}
                        type="submit">
                        Create
                    </AsyncButton>
                </DialogActions>
            </form>
        </Dialog>
        <Button variant="contained" onClick={handleClickOpen} startIcon={<CreateIcon/>}>
            Create new vcluster
        </Button>
    </Stack>
}