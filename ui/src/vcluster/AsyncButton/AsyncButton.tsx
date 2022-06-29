import React from "react";
import {ButtonBaseProps, Tooltip} from "@mui/material";
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
    startIcon?: any;
}

interface AsyncButtonState {
    loading: boolean;
}

export default class AsyncButton extends React.PureComponent<AsyncButtonProps, AsyncButtonState> {
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

        const button = <LoadingButton {...without(this.props, ["onClickAsync"])}
                                      loading={this.state.loading} {...(this.props.onClickAsync ? {onClick} : {})} className={classNames.join(" ")}>
            <span className={"async-button-content"}>{this.props.children}</span>
        </LoadingButton>;
        if (this.props.tooltip) {
            return <Tooltip title={this.props.tooltip}>{button}</Tooltip>
        }
        return button;
    }
}