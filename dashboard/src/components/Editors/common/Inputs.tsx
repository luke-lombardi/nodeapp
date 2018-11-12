import React from 'react';
import  { Component }  from 'react';
import styles from '../../styles/Inputs';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

interface IProps {
  field: string;
  label: string;
  data: any;
  handleChange: any;
  required: boolean;
  disabled: boolean;
}

interface IState {

}

class TextInputUnstyled extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;

    return (
      <TextField
        label={this.props.label}
        className={classes.textField}
        value={ this.props.data[this.props.field] !== undefined ? this.props.data[this.props.field] : ''}
        onChange={(event) => { this.props.handleChange(this.props.field, event.target.value); }}
        margin='normal'
        variant='outlined'
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        disabled={this.props.disabled}
        required={this.props.required}
      />
    );
  }
}

class TextInputMultilineUnstyled extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;

    return (
      <TextField
        multiline
        label={this.props.label}
        className={classes.textField}
        value={ this.props.data[this.props.field] !== undefined ? this.props.data[this.props.field] : ''}
        onChange={(event) => { this.props.handleChange(this.props.field, event.target.value); }}
        margin='normal'
        variant='outlined'
        rows='4'
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        required={this.props.required}
        />
    );
  }
}

class TimeInputUnstyled extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;

    return (
      <TextField
        label={this.props.label}
        className={classes.textField}
        value={ this.props.data[this.props.field] !== undefined ? this.props.data[this.props.field] : ''}
        onChange={(event) => { this.props.handleChange(this.props.field, event.target.value); }}
        margin='normal'
        variant='outlined'
        type='time'
        fullWidth
        required={this.props.required}
        InputLabelProps={{
          shrink: true,
        }}
      />
    );
  }
}

class DateInputUnstyled extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;

    return (
      <TextField
        label={this.props.label}
        className={classes.textField}
        value={ this.props.data[this.props.field] !== undefined ? this.props.data[this.props.field] : ''}
        onChange={(event) => { this.props.handleChange(this.props.field, event.target.value); }}
        margin='normal'
        variant='outlined'
        type='date'
        fullWidth
        required={this.props.required}
        InputLabelProps={{
          shrink: true,
        }}
      />
    );
  }
}

interface IPropsSelect {
  field: string;
  label: string;
  data: any;
  handleChange: any;
  listData: any;
  required: boolean;
  disabled: boolean;
}

class SelectInputUnstyled extends Component<IPropsSelect, IState> {
  constructor(props: IPropsSelect) {
    super(props);
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;

    return (
      <TextField
      select
      label={this.props.label}
      className={classes.textField}
      value={ this.props.data[this.props.field] !== undefined ? this.props.data[this.props.field] : ''}
      onChange={(event) => { this.props.handleChange(this.props.field, event.target.value); }}
      SelectProps={{
        MenuProps: {
          className: classes.menu,
        },
      }}
      disabled={this.props.disabled}
      // type='search'
      margin='normal'
      variant='outlined'
      fullWidth
      required={this.props.required}
      InputLabelProps={{
        shrink: true,
      }}
      >

      {
      // @ts-ignore
      this.props.listData.map(client => (
        // @ts-ignore
        <MenuItem key={client.id} value={client.id}>
          {
            // @ts-ignore
            client.name
          }
        </MenuItem>
        ))
      }

      </TextField>
    );
  }
}

// @ts-ignore
export const TextInput = withStyles(styles)(TextInputUnstyled);
// @ts-ignore
export const TimeInput = withStyles(styles)(TimeInputUnstyled);
// @ts-ignore
export const DateInput = withStyles(styles)(DateInputUnstyled);
// @ts-ignore
export const SelectInput = withStyles(styles)(SelectInputUnstyled);
// @ts-ignore
export const MultilineInput = withStyles(styles)(TextInputMultilineUnstyled);