import React from "react";
import {Button, ButtonBaseProps, IconButton, Tooltip} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

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

        const classNames = ["async-button"];
        if (this.props.className) {
            classNames.push(this.props.className);
        }
        if (this.state.loading) {
            classNames.push("async-button-loading");
        }

        let button
        if (this.state.loading) {
            button = <LoadingButton {...without(this.props, ["onClickAsync", "buttonType"])}
                                    loading={this.state.loading} {...(this.props.onClickAsync ? {onClick} : {})}
                                    className={classNames.join(" ")}>{this.props.children}
            </LoadingButton>;
        } else {
            if (this.props.buttonType === 'normal') {
                button = <Button
                    {...without(this.props, ["onClickAsync", "buttonType"])} {...(this.props.onClickAsync ? {onClick} : {})}
                    className={classNames.join(" ")}>
                    {this.props.children}
                </Button>;
            } else {
                button = <IconButton
                    {...without(this.props, ["onClickAsync", "buttonType"])} {...(this.props.onClickAsync ? {onClick} : {})}
                    className={classNames.join(" ")}>
                    {this.props.children}
                </IconButton>;
            }
        }
        if (this.props.tooltip) {
            return <Tooltip title={this.props.tooltip}><span>{button}</span></Tooltip>
        }
        return button;
    }
}