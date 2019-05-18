import React from 'react';
import  { Component }  from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import styles from '../styles/EditClient';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import BackArrowIcon from '@material-ui/icons/ArrowBack';
import CardContent from '@material-ui/core/CardContent';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
// import FormGroup from '@material-ui/core/FormGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
import SaveIcon from '@material-ui/icons/Save';
import Snackbar from '@material-ui/core/Snackbar';
import LinearProgress from '@material-ui/core/LinearProgress';
import classNames from 'classnames';
import TextField from '@material-ui/core/TextField';
// import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
// @ts-ignore
import Utils from './common/Utils';
import { ConfigGlobalLoader } from '../../services/config/ConfigGlobal';
// import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
// Services
import ApiService from '../../services/ApiService';
import SleepUtil from '../../services/SleepUtil';
// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';
import { PageChangedActionCreator } from '../../actions/NavActions';
import { FiltersChangedActionCreator } from '../../actions/FilterActions';
import { AuthStateChangeActionCreator } from '../../actions/AuthActions';

interface IProps {
  readonly currentPage: string;
  readonly currentFilters: any;
  readonly auth: any;
  history: any;
  // Actions
  currentPageChanged?: (currentPage: string) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  currentFiltersChanged?: (currentFilters: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  authStateChanged?: (auth: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

// // These are the columns of the warehouse table that are editable in this view
// interface IData {
//   name: string,
//   title: string,
//   phone: number,
//   email: string,
//   department: string
//   probability: number,
//   mrr: number,
//   notes: string,
//   status: string,
//   product: string
// }

interface IState {
  newLead: boolean;
  campaignArgs: any;
  isErrorOpen: boolean;
  isDeleteOpen: boolean;
  messages: Array<string>;
  toList: boolean;
  toLogin: boolean;
  snackbarMessage: string;
  snackbarVisible: boolean;
  isLoading: boolean;
  send_time: any;
  subscribers: any;
  selectedSubscriber: Array<any>;
}

class EditClient extends Component<IProps, IState> {
  // @ts-ignore
  private apiService: ApiService;
  // @ts-ignore
  private readonly configGlobal = ConfigGlobalLoader.config;

  constructor(props: IProps) {
    super(props);

    // Initialize state variables
    this.state = {
      campaignArgs: {
        name: '',
        status: '',
        send_time: '',
        message_body: '',
        subscribers: '',
        reply: '',
    },
      subscribers: [],
      newLead: false,
      isErrorOpen: false,
      isDeleteOpen: false,
      messages: [],
      send_time: undefined,
      toList: false,
      toLogin: false,
      snackbarMessage: '',
      snackbarVisible: false,
      isLoading: false,
      selectedSubscriber: [],
    };

    this.handleAuthChange = this.handleAuthChange.bind(this);
    this.handleMultipleChange = this.handleMultipleChange.bind(this);

    // Make any API calls through the API service
    this.apiService = new ApiService({functions: {authChanged: this.handleAuthChange}});

    // Bind functions
    this.componentDidMount = this.componentDidMount.bind(this);

    this.handleChange = this.handleChange.bind(this);

    this.loadData = this.loadData.bind(this);
    this.setData = this.setData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.uploadList = this.uploadList.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.showSnackbar = this.showSnackbar.bind(this);
    // this._deleteWarehouse = this._deleteWarehouse.bind(this);
  }

  componentDidMount() {
    // if action is edit, load campaignArgs from campaign object in DB
    console.log('EditLead component mounted');

    // @ts-ignore
    this.props.currentPageChanged('client_editor');

    // When the component is mounted, set the state variables w/ fresh data from the APIs
    this.loadData();
    this.setData();
  }

  async handleAuthChange(auth: any) {
    // @ts-ignore
    await this.props.authStateChanged(auth);
  }

  async handleMultipleChange(event: any) {
    // let selected = this.state.subscribers.filter(i => i.id === event.target.value[0]);
    await this.setState({selectedSubscriber: event.target.value});
    }

  async handleChange(name: string, value: any) {
    let campaignArgs = this.state.campaignArgs;
    campaignArgs[name] = value;
    await this.setState({
      campaignArgs: campaignArgs,
    });
  }

  async loadData() {
    // if (window.location.href.includes('edit')) {
    //   let campaignId = window.location.href.length - 2;
    //   // let savedCampaign = await this.apiService.GetSavedCampaign(campaignId);
    //   console.log('got saved campaign', savedCampaign);
    //   this.setState({campaignArgs: savedCampaign});
    // }

    let subscribers = await this.apiService.getGroups();
    console.log('subscribers', subscribers);
    if (subscribers !== undefined) {
      // @ts-ignore
      this.setState({subscribers: subscribers});
    }
    console.log('No data to load');
  }

  async setData() {

    await this.showSnackbar('Loaded lead data', 1000);
  }

  // Saves the athlete data and settings
  // Makes two API calls, one to /updateSetting, and one to /updateRow
  async saveData() {
    // save customer data to db
    // if (!Utils._validateFields(this.state)) {
    //   this.setState({ isErrorOpen: true });
    //   return;
    // }

    await this.setState({isLoading: true});

    let args = {
      name: this.state.campaignArgs.name,
      status: this.state.campaignArgs.status,
      send_time: this.state.send_time,
      message_body: this.state.campaignArgs.message_body,
      from_number: this.state.campaignArgs.from_number,
      subscribers: this.state.selectedSubscriber,
      reply: this.state.campaignArgs.reply,
    };

    console.log(args);
    // Build request body
    // Save the new lead data

    let response = await this.apiService.createLead(args);

    if (response !== undefined) {
      await this.setState({isLoading: false});
      await this.showSnackbar('saved lead to databaase', 1000);

      return response;
      }
    await this.setState({isLoading: false});
    await this.showSnackbar('Error saving lead!', 1000);
    return undefined;
    }

  async uploadList() {
    //
  }

  async _deleteClient() {
    this.setState({ isDeleteOpen: true });
  }

  async showSnackbar(message: string, durationMS: number) {
    await this.setState({
      snackbarMessage: message,
      snackbarVisible: true,
    });

    await SleepUtil.SleepAsync(durationMS);

    await this.setState({
      snackbarVisible: false,
    });
  }

  render() {
    console.log(this.state.subscribers);
    console.log(this.state.selectedSubscriber);
    // @ts-ignore
    const { classes } = this.props;

    if (this.state.toList === true) {
      return <Redirect to='/clients' />;
    } else if (this.props.auth.loggedIn === false) {
      return <Redirect to='/login' />;
    }

    return (
      <div className={classes.editContainer}>
          <Link to='/clients'>
          <IconButton className={classes.button} aria-label='Go Back'>
            <BackArrowIcon />
          </IconButton>
          </Link>
          <Divider style={{marginBottom: 20}} />
          <Grid container direction='row' justify='center' alignItems='stretch' spacing={8}>
          <Grid justify='center' alignItems='center' item xs={12}>
          <Paper style={{padding: 20}} className={classes.paper}>
          <h4 style={{alignSelf: 'center'}}> Enter Message Details </h4>
              {/* INPUT: Client id */}
              <TextField
                style={{width: 300}}
                className={classes.textField}
                margin='normal'
                variant='outlined'
                label='title'
                defaultValue='enter a title...'
                multiline
                rows='4'
                name='name'
                value={this.state.campaignArgs.name}
                onChange={(event) => this.handleChange('name', event.target.value)}
              />
              <TextField
                style={{width: 500}}
                className={classes.textField}
                margin='normal'
                variant='outlined'
                label='message body'
                defaultValue='enter your message...'
                multiline
                rows='4'
                name='message_body'
                value={this.state.campaignArgs.message_body}
                onChange={(event) => this.handleChange('message_body', event.target.value)}
              />
              {/* <TextField
                className={classes.textField}
                margin='normal'
                variant='outlined'
                label='subscribers'
                defaultValue='enter message recepients'
                multiline
                rows='4'
                name='subscribers'
                value={this.state.campaignArgs.subscribers}
                onChange={(event) => this.handleChange('subscribers', event.target.value)}
              /> */}
          <div>
          <TextField
            style={{marginLeft: 15}}
            type='datetime-local'
            defaultValue='2019-05-04T20:35'
            label='Scheduled Date'
            name='send_time'
            value={this.state.send_time}
            onChange={(event) => this.setState({send_time: event.target.value})}
          />
          </div>
        <br />
        {
          this.state.isLoading
            &&
           <LinearProgress
            classes={{ colorPrimary: classes.colorPrimary, barColorPrimary: classes.barColorPrimary }}
          />
        }
        <Snackbar
        ContentProps={{
          classes: {
              root: classes.snackbar,
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={this.state.snackbarVisible}
        message={<span> {this.state.snackbarMessage} </span>}
        />
      </Paper>

      <Paper style={{padding: 50, marginTop: 50}} className={classes.paper}>
      <h4>Select Subscribers</h4>
      <FormControl className={classes.formControl}>
            <Select
              style={{width: 300}}
              fullWidth
              multiple
              value={this.state.selectedSubscriber}
              inputProps={{
                id: 'select-multiple-native',
              }}
              onChange={(event) => this.handleMultipleChange(event)}
              input={<Input id='select-multiple-checkbox' />}
              renderValue={selected => {
                return (
                <span style={{ color: '#ff4081' }}>
                  {this.state.selectedSubscriber.join(', ')}
                </span>
                ); }
              }
              >
              {
                // @ts-ignore
                this.state.subscribers.map(subscriber => (
                <MenuItem key={subscriber.id} value={subscriber.id}>
                  <Checkbox checked={this.state.selectedSubscriber.includes(subscriber.id)} color='primary' />
                  <ListItemText primary={subscriber.name} />
                </MenuItem>
              ))}
            >
            </Select>
          </FormControl>
      </Paper>

      <Paper style={{padding: 25, marginTop: 50}} className={classes.paper}>
      {/* <FormControlLabel
        control={
          <Checkbox
            // checked={state.checkedB}
            // onChange={handleChange('checkedB')}
            value='checkedB'
            color='primary'
          />
        }
        label='Tag subscribers who reply to this message'
      /> */}
      <h4>Send a reply to users who respond to this message</h4>

      <TextField
        style={{width: 500}}
        className={classes.textField}
        margin='normal'
        variant='outlined'
        label='thanks for signing up!'
        defaultValue='thanks for signing up!'
        multiline
        rows='4'
        name='message_body'
        value={this.state.campaignArgs.reply}
        onChange={(event) => this.handleChange('reply', event.target.value)}
      />
      </Paper>

      <Paper style={{padding: 50, marginTop: 50}} className={classes.paper}>
      <h4>Message Preview</h4>
      <Card className={classes.card}>
      <CardContent>
      <p>{this.state.campaignArgs.message_body}</p>
      </CardContent>
      </Card>
      <div>
          <Button variant='contained' size='large' className={classes.button} onClick={this.saveData} disabled={this.state.isLoading}>
              <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Schedule Campaign
          </Button>
          <Button variant='contained' size='large' className={classes.button} disabled={this.state.newLead} onClick={this.confirmDelete}>
              <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Cancel
          </Button>
        </div>
      </Paper>
      </Grid>
      </Grid>
      </div>
    );
  }

  private confirmDelete = async () => {
    this.setState({ isDeleteOpen: false });

    this.setState({ toList: true });
  }
}

function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    auth: state.auth,
    currentPage: state.currentPage,
    currentFilters: state.currentFilters,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    currentPageChanged: bindActionCreators(PageChangedActionCreator, dispatch),
    currentFiltersChanged: bindActionCreators(FiltersChangedActionCreator, dispatch),
    authStateChanged: bindActionCreators(AuthStateChangeActionCreator, dispatch),
  };
}

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EditClient));