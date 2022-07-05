import React from "react";
import {Box, Button, ButtonBaseProps, CircularProgress, Fab, Tooltip} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import {blueGrey} from "@mui/material/colors";

const without = (props: any, keys: string[]) => {
    if (!props) {
        return props;
    }

    return Object.keys(props).filter(key => keys.indexOf(key) === -1).reduce((retVal: any, key) => {
        retVal[key] = props[key];
        return retVal;
    }, {});
}

export interface AsyncButtonProps extends ButtonBaseProps {
    onClickAsync?: (e: React.MouseEvent<HTMLElement>) => Promise<any>;
    tooltip?: string;
    variant?: string;
    buttonType?: string;
}

interface AsyncButtonState {
    loading: boolean;
}

export class AsyncButton extends React.PureComponent<AsyncButtonProps, AsyncButtonState> {
    mounted: boolean = true;
    state: AsyncButtonState = {
        loading: false
    };

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        const onClick = async (e: React.MouseEvent<HTMLElement>) => {
            this.setState({loading: true});

            try {
                if (this.props.onClickAsync) {
                    await this.props.onClickAsync(e);
                }
            } catch (err) {
                console.error(err);
            }

            window.setTimeout(() => {
                if (this.mounted) {
                    this.setState({loading: false});
                }
            }, 400);
        };

        let button
        if (this.state.loading) {
            if (this.props.buttonType === 'normal') {
                button = <LoadingButton
                    {...without(this.props, ["onClickAsync", "buttonType"])}
                    loading={this.state.loading} {...(this.props.onClickAsync ? {onClick} : {})}>{this.props.children}
                </LoadingButton>;
            } else {
                button = <Box sx={{position: 'relative'}}>
                    <Fab size="small" disabled={true}>
                        {this.props.children}
                    </Fab>
                    {this.state.loading && (
                        <CircularProgress
                            size={45}
                            sx={{
                                color: blueGrey[500],
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                zIndex: 1,
                            }}
                        />
                    )}
                </Box>;
            }
        } else {
            if (this.props.buttonType === 'normal') {
                button = <Button
                    {...without(this.props, ["onClickAsync", "buttonType"])} {...(this.props.onClickAsync ? {onClick} : {})}>
                    {this.props.children}
                </Button>;
            } else {
                button = <Fab sx={{
                    boxShadow: 0
                }}
                              size="small"  {...without(this.props, ["onClickAsync", "buttonType"])} {...(this.props.onClickAsync ? {onClick} : {})}>
                    {this.props.children}
                </Fab>;
            }
        }
        if (this.props.tooltip) {
            return <Tooltip title={this.props.tooltip}><span>{button}</span></Tooltip>
        }
        return button;
    }
}