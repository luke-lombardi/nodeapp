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
import { AuthService } from 'src/services/AuthService';
// import { Snackbar } from 'material-ui';

interface IProps {
  readonly currentPage: string;
  readonly currentFilters: any;
}

interface IState {
  userInfo: any;
}

class Login extends Component<IProps, IState> {
  authService: AuthService;

  state = {
    open: true,
    userInfo: {
      username: '',
      password: '',
    },
  };

  constructor(props: IProps) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.logIn = this.logIn.bind(this);
    this.authService = new AuthService({});
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    //
  }

  async handleChange(name: string, value: any) {
    let userInfo = this.state.userInfo;
    userInfo[name] = value;
    await this.setState({
      userInfo: userInfo,
    });
  }

  async logIn() {
    if (this.state.userInfo.username && this.state.userInfo.password !== undefined || '' ) {
      await this.authService.loginUser(this.state.userInfo);
    }
    console.log('invalid login');
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
              <InputLabel htmlFor='email'>Username</InputLabel>
              <Input id='email' name='email' autoComplete='email'
              autoFocus onChange={(event) => this.handleChange('username', event.target.value)} value={this.state.userInfo.username} />
            </FormControl>
            <FormControl margin='normal' required fullWidth>
              <InputLabel htmlFor='password'>Password</InputLabel>
              <Input name='password' type='password' id='password'
              autoComplete='current-password' onChange={(event) => this.handleChange('password', event.target.value)} value={this.state.userInfo.password}/>
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
