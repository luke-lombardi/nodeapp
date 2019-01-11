import React from 'react';
import  { Component }  from 'react';
// @ts-ignore
const { Auth } = require('../../../node_modules/aws-amplify');
// @ts-ignore
const Amplify = require('../../../node_modules/aws-amplify');

import { Redirect } from 'react-router';

import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import LockIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
// @ts-ignore
import classNames from 'classnames';

// @ts-ignore
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';
// @ts-ignore
import { AuthStateChangeActionCreator, IAuthChanged } from '../../actions/AuthActions';

import styles from '../styles/Login';
import { withStyles } from '@material-ui/core/styles';
// @ts-ignore
import Divider from '@material-ui/core/Divider';

// @ts-ignore
import CardContent from '@material-ui/core/CardContent';
// @ts-ignore
import MaterialTable from 'material-table';
// @ts-ignore
import MainMap from '../common/MainMap';
import { TextInput } from '../Editors/common/Inputs';
// @ts-ignore
import LocationSearchInput from '../common/LocationInput';

// @ts-ignore
import PlacesAutocomplete from 'react-places-autocomplete';

// @ts-ignore
import Button from '@material-ui/core/Button';

// services
import { AuthService } from '../../services/AuthService';

interface IProps {
    readonly auth: any;
    authStateChanged?: (auth: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  }

interface IState {
    user: any;
    isLoading: boolean;
}

export class Login extends Component<IProps, IState> {
  // @ts-ignore
  private authService: AuthService;

  constructor(props: IProps) {
    super(props);

    this.state = {
      user: {
        username: '',
        password: ''
      },
      isLoading: false,
    },

    this.componentDidMount = this.componentDidMount.bind(this);

    this.handleAuthChange = this.handleAuthChange.bind(this);

    this.handleChange = this.handleChange.bind(this);

    // this.authService.StartMonitoring();
    this.login = this.login.bind(this);
  }

  async handleAuthChange(auth: any) {
    // @ts-ignore
    await this.props.authStateChanged(auth);
  }

  componentDidMount() {
    // Connect to the cognito user pool
    Amplify.configure({
      Auth: {
          identityPoolId: '7i8lcrp8i56gepd8k3s5afoe9i', // Amazon Cognito Identity Pool ID
          region: 'us-east-1_qEU8dAgtl', // Amazon Cognito Region
      }
  });
}

async handleChange(name: string, value: any) {
  let user = this.state.user;
  user[user.username] = value;
  user[user.password] = value;
  await this.setState({
    user: user,
  });
}

  render() {
    // @ts-ignore
    const { classes } = this.props;

    if (this.props.auth.loggedIn === true) {
      return <Redirect to='/login' />; }

    return (
          // @ts-ignore
        <main className={classes.main}>
          <CssBaseline />
          <Paper className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form className={classes.form}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="email">Username</InputLabel>
                <TextInput data={this.state.user.username} handleChange={this.handleChange} id="email" name="Username" autoComplete="username" autoFocus />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <TextInput data={this.state.user.password} handleChange={this.handleChange} id="password" name="Password" autoComplete="password" autoFocus />
              </FormControl>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                onSubmit={this.login}
                className={classes.submit}
              >
                Sign in
              </Button>
            </form>
          </Paper>
        </main>
      );
    }
  
  // private async userLoggedIn(props: IAuthChanged) {
  //   await this.props.authStateChanged(props.authStateChanged);
  // }

  private async login() {
    this.setState({isLoading: true});
    try {
      await Auth.signIn(this.state.user.email, this.state.user.password);
      alert("Logged in");
    } catch (e) {
      alert(e.message);
    }
  }
}
     // @ts-ignore
     // this.refs.toast.show('Please enter a valid password');


 // @ts-ignore
 function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    auth: state.auth,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    authStateChanged: bindActionCreators(AuthStateChangeActionCreator, dispatch),
  };
}

    // @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Login));