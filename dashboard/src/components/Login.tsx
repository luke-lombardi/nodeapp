import React from 'react';
import  { Component }  from 'react';
// @ts-ignore
import { withRouter } from 'react-router';
// Import custom styles
import LoginStyles from './styles/Login';
// Import redux stuff
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

interface IProps {
  readonly currentPage: string;
  readonly currentFilters: any;
}

interface IState {
}

class Login extends Component<IProps, IState> {
  state = {
    open: true,
  };

  constructor(props: IProps) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.logIn = this.logIn.bind(this);
  }

  componentDidMount() {
    //
  }

  logIn() {
    //
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;
    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Typography component='h1' variant='h5'>
            Login
          </Typography>
          <form className={classes.form}>
            <FormControl margin='normal' required fullWidth>
              <InputLabel htmlFor='email'>Email Address</InputLabel>
              <Input id='email' name='email' autoComplete='email' autoFocus />
            </FormControl>
            <FormControl margin='normal' required fullWidth>
              <InputLabel htmlFor='password'>Password</InputLabel>
              <Input name='password' type='password' id='password' autoComplete='current-password' />
            </FormControl>
            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              onSubmit={this.logIn}
            >
              Sign in
            </Button>
          </form>
        </Paper>
      </main>
    );
  }
}

// @ts-ignore
export default withRouter(connect()(withStyles(LoginStyles)(Login)));
