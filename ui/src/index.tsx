import React from "react";
import ReactDOM from "react-dom";
import {App} from "./App";
import {StyledEngineProvider} from "@mui/material";

ReactDOM.render(
    <React.StrictMode>
        <StyledEngineProvider injectFirst>
            <App/>
        </StyledEngineProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
