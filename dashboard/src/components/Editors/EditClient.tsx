import React from 'react';
import  { Component }  from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import styles from '../styles/EditClient';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import BackArrowIcon from '@material-ui/icons/ArrowBack';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import SaveIcon from '@material-ui/icons/Save';
import Snackbar from '@material-ui/core/Snackbar';
import LinearProgress from '@material-ui/core/LinearProgress';
import classNames from 'classnames';
import TextField from '@material-ui/core/TextField';
// import Select from '@material-ui/core/Select';
// import InputLabel from '@material-ui/core/InputLabel';
// import MenuItem from '@material-ui/core/MenuItem';
// import Input from '@material-ui/core/Input';

// @ts-ignore
import Utils from './common/Utils';
import { TextInput } from './common/Inputs';

import { ConfigGlobalLoader } from '../../services/config/ConfigGlobal';

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
  leadData: any;
  isErrorOpen: boolean;
  isDeleteOpen: boolean;
  messages: Array<string>;
  toList: boolean;
  toLogin: boolean;
  snackbarMessage: string;
  snackbarVisible: boolean;
  isLoading: boolean;
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
      leadData: {
        name: '',
        title: '',
        phone: '',
        email: '',
        department: '',
        probability: 0.0,
        mrr: 0.0,
        notes: '',
        status: '',
        product: '',
    },
      newLead: false,
      isErrorOpen: false,
      isDeleteOpen: false,
      messages: [],

      toList: false,
      toLogin: false,
      snackbarMessage: '',
      snackbarVisible: false,
      isLoading: false,
    };

    this.handleAuthChange = this.handleAuthChange.bind(this);

    // Make any API calls through the API service
    this.apiService = new ApiService({functions: {authChanged: this.handleAuthChange}});

    // Bind functions
    this.componentDidMount = this.componentDidMount.bind(this);

    this.handleChange = this.handleChange.bind(this);

    this.loadData = this.loadData.bind(this);
    this.setData = this.setData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.showSnackbar = this.showSnackbar.bind(this);
    // this._deleteWarehouse = this._deleteWarehouse.bind(this);
  }

  componentDidMount() {
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

  async handleChange(name: string, value: any) {
    let leadData = this.state.leadData;
    leadData[name] = value;
    await this.setState({
      leadData: leadData,
    });
  }

  async loadData() {
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

    let leadData = {
      name: this.state.leadData.name,
      title: this.state.leadData.title,
      phone: this.state.leadData.phone,
      email: this.state.leadData.email,
      department: this.state.leadData.department,
      probability: this.state.leadData.probability,
      mrr: this.state.leadData.mrr,
      notes: this.state.leadData.notes,
      status: this.state.leadData.status,
      product: this.state.leadData.product,
    };
    // Build request body
    // Save the new lead data

    let response = await this.apiService.createLead(leadData);

    if (response !== undefined) {
      await this.setState({isLoading: false});
      await this.showSnackbar('saved lead to databaase', 1000);

      return response;
      }
    await this.setState({isLoading: false});
    await this.showSnackbar('Error saving lead!', 1000);
    return undefined;
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

          <Divider />

          <form className={classes.container} noValidate autoComplete='off'>
              <h4> Create New Campaign </h4>
              {/* INPUT: Client id */}
              <TextInput label='Campaign Name' field='name' data={this.state.leadData} handleChange={this.handleChange} />
              <TextField
                id='outlined-multiline-flexible'
                label='Multiline'
                multiline
                rowsMax='4'
                // value={this.state.multiline}
                // onChange={this.handleChange('multiline')}
                className={classes.textField}
                margin='normal'
                helperText='hello'
                variant='outlined'
              />
              <TextField
                id='outlined-select-currency'
                select
                label='Select'
                className={classes.textField}
                // value={this.state.currency}
                // onChange={this.handleChange('currency')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                helperText='Please select your currency'
                margin='normal'
                variant='outlined'
              >
              {/* {currencies.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))} */}
              </TextField>
              <TextField
                margin='normal'
                variant='outlined'
                id='datetime-local'
                label='Next appointment'
                type='datetime-local'
                defaultValue='2017-05-24T10:30'
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <input
                accept='image/*'
                className={classes.input}
                style={{ display: 'none' }}
                id='raised-button-file'
                multiple
                type='file'
              />
              <label htmlFor='raised-button-file'>
                <Button variant='raised' component='span' className={classes.input}>
                  Upload Image
                </Button>
              </label>
              <TextInput label='Message' field='department' data={this.state.leadData} handleChange={this.handleChange} />
              <TextInput label='Phone' field='phone' data={this.state.leadData} handleChange={this.handleChange} />
              {/* INPUT: Enable processing */}
              <FormGroup row>
                <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.leadData.enableProcessing}
                    // onClick={ (event) => { this.handleChange('enableProcessing', !this.state.leadData.enableProcessing); }}
                    value={this.state.leadData.enableProcessing}
                  />
                }
              label='Add "Reply STOP to unsubscribe"'
            />
            </FormGroup>
          </form>

      <Divider />
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