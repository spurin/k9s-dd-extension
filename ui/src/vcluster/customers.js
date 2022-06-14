import React from "react";
import {Button, Grid} from "@material-ui/core";
import {DataGrid} from "@material-ui/data-grid";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

// my initial data which I'm passing to state names customers
const customerData = [
    {id: 1, name: "Customer 1", gender: "Male", email: "user@gmail.com"},
    {id: 2, name: "Customer 2", gender: "Male", email: "user@gmail.com"},
    {id: 3, name: "Customer 3", gender: "Female", email: "user@gmail.com"}
];

const CustomerList = () => {
    const [customers, setCustomers] = React.useState(customerData);
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [gender, setGender] = React.useState("");
    const [email, setEmail] = React.useState("");

    // just to render MUI DataGrid
    const columns = [
        {field: "id", headerName: "ID", width: 70},
        {field: "name", headerName: "Name", width: 200},
        {
            field: "gender",
            headerName: "Gender",
            width: 150
        },
        {
            field: "email",
            headerName: "Email",
            description: "This column has a value getter and is not sortable.",
            width: 250
        },
        {
            field: "action",
            headerName: "Action",
            width: 250,

            // Important: passing id from customers state so I can delete or edit each user
            renderCell: (id) => (
                <>
                    <Button
                        style={{
                            backgroundColor: "#ffcc00",
                            marginRight: 40,
                            padding: "3px 35px"
                        }}
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Edit
                    </Button>

                    <Button
                        style={{
                            backgroundColor: "#e8605d",
                            padding: "3px 35px"
                        }}
                        onClick={() => handleDelete(id)}
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Delete
                    </Button>
                </>
            )
        }
    ];

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = (clickedUser) => {
        setCustomers(customers.filter((user) => user.id !== clickedUser.id));
        console.log(clickedUser.id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(e.value);
        const newCustomer = {
            id: Math.floor(Math.random() * 999),
            name: name,
            gender: gender,
            email: email
        };
        setCustomers([...customers, newCustomer]);
        console.log(`user data is ${newCustomer}`);
        console.log(customers);
    };

    return (
        <>
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                className={classes.listHeader}
            >
                <Grid item md={8}></Grid>

                <Grid item md={4}>
                    <Button
                        className={classes.btn}
                        onClick={handleClickOpen}
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Add New Customer
                    </Button>

                    <Dialog
                        disableBackdropClick
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="form-dialog-title"
                    >
                        <DialogTitle id="form-dialog-title">Add New Customer</DialogTitle>
                        <form noValidate onSubmit={handleSubmit}>
                            <DialogContent>
                                <TextField
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    autoFocus
                                    margin="dense"
                                    id="name"
                                    label="Name"
                                    type="text"
                                    fullWidth
                                />
                                <TextField
                                    value={gender}
                                    onChange={(event) => setGender(event.target.value)}
                                    margin="dense"
                                    id="gender"
                                    label="Gender"
                                    type="text"
                                    fullWidth
                                />
                                <TextField
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    margin="dense"
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    fullWidth
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={handleClose} color="primary" type="submit">
                                    Add
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>
                </Grid>
            </Grid>

            <div className={classes.customerList}>
                <DataGrid
                    rows={customers}
                    columns={columns}
                    pageSize={5}
                    checkboxSelection={false}
                    disableSelectionOnClick={true}
                />
            </div>
        </>
    );
};

export default CustomerList;