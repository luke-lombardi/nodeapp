import React from 'react';
import  { Component }  from 'react';
import styles from '../styles/EditWarehouse';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import BackArrowIcon from '@material-ui/icons/ArrowBack';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';
import SaveIcon from '@material-ui/icons/Save';
import Snackbar from '@material-ui/core/Snackbar';
import LinearProgress from '@material-ui/core/LinearProgress';
import classNames from 'classnames';
// @ts-ignore
import Utils from './common/Utils';
import { weekdays } from './common/ListData';
import { TextInput, TimeInput, SelectInput } from './common/Inputs';

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

// These are the columns of the warehouse table that are editable in this view
interface IData {
  id: number;
  clientId: number;
  name: string;
  location: string;
  timezone: string;
  opDayStart: string;
  weekStart: string;
  showEngagement: boolean;
  updateEngagement: boolean;
  hideJudgement: boolean;
  displayNames: boolean;
}

interface IState {
  tabIndex: number;
  jobFunctions: [];
  warehouses: [];
  clients: [];
  shifts: [];
  newWarehouse: boolean;
  settingId: number;
  warehouseData: any;
  warehouseSettings: any;
  settingsModified: boolean;
  isErrorOpen: boolean;
  isDeleteOpen: boolean;
  messages: Array<string>;
  toList: boolean;
  snackbarMessage: string;
  snackbarVisible: boolean;
  isLoading: boolean;
}

class EditWarehouse extends Component<IProps, IState> {
  private apiService: ApiService;
  // @ts-ignore
  private readonly configGlobal = ConfigGlobalLoader.config;

  constructor(props: IProps) {
    super(props);

    // Initialize state variables
    this.state = {
      tabIndex: 0,
      jobFunctions: [],
      warehouses: [],
      clients: [],
      shifts: [],
      settingsModified: false,
      warehouseSettings: {
        athleteEnabled: false,
        enagementEnabled: false,
        showBaselineModal: false,
        showSafetyScoreModal: false,
        showHapticModal: false,
        hapticEnabled: false,
        hapticBendNumber: 0,
        hapticBendPercentile: 0,
        hapticFeedbackWindow: 0,
        hapticFeedbackGap: 0,
        hapticSingleBendWindow: 0,
        hapticSagAngleThreshold: 0,
      },

      warehouseData: {
        id: 0,
        clientId: 0,
        name: '',
        location: '',
        timezone: '',
        opDayStart: '00:00',
        weekStart: 'Sunday',
        showEngagement: false,
        updateEngagement: false,
        hideJudgement: true,
        displayNames: true,
      } as IData,

      newWarehouse: false,
      settingId: 0,
      isErrorOpen: false,
      isDeleteOpen: false,
      messages: [],
      toList: false,
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
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);

    this.validateForm =  this.validateForm.bind(this);
    this.loadData = this.loadData.bind(this);
    this.setData = this.setData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.showSnackbar = this.showSnackbar.bind(this);
    // this._deleteWarehouse = this._deleteWarehouse.bind(this);
  }

  componentDidMount() {
    console.log('EditWarehouse component mounted');

    // @ts-ignore
    this.props.currentPageChanged('warehouse_editor');

    // When the component is mounted, set the state variables w/ fresh data from the APIs
    this.loadData();
    this.setData();
  }

  async handleAuthChange(auth: any) {
    // @ts-ignore
    await this.props.authStateChanged(auth);
  }

  async handleChangeTab(event: any, value: number) {
    await this.setState({tabIndex: value});
  }

  async handleChange(name: string, value: any) {
    let warehouseData = this.state.warehouseData;
    warehouseData[name] = value;
    await this.setState({
      warehouseData: warehouseData,
    });
  }

  async handleSettingsChange(name: string, event: any) {
    let settingsModified = false;
    let warehouseSettings = this.state.warehouseSettings;
    let value = event.target.value;

    if (value !== warehouseSettings[name]) {
      settingsModified = true;
    }

    warehouseSettings[name] = value;

    await this.setState({
      warehouseSettings: warehouseSettings,
      settingsModified: settingsModified,
    });
  }

  async loadData() {
    let clients = await this.apiService.GetClientsAsync();
    await this.setState({clients: clients});
  }

  async setData() {
    await this.showSnackbar('Loaded warehouse data', 1000);
  }

  // Saves the athlete data and settings
  // Makes two API calls, one to /updateSetting, and one to /updateRow
  async saveData() {
    // @ts-ignore
    let currentSettingId = this.state.settingId;
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
          <Link to='/warehouses'>
          <IconButton className={classes.button} aria-label='Go Back'>
            <BackArrowIcon />
          </IconButton>
          </Link>

          <Divider />
          <Tabs
            value={this.state.tabIndex}
            onChange={this.handleChangeTab}
            indicatorColor='primary'
            textColor='primary'
            fullWidth
          >
          <Tab label='Main' />
          <Tab label='Settings' />
          </Tabs>

          <SwipeableViews
              axis={'x'}
              index={this.state.tabIndex}
          >
          <form className={classes.container} noValidate autoComplete='off'>
              <h4> Warehouse Info </h4>
              {/* INPUT: Client  */}
              <SelectInput label='Client' field='clientId' data={this.state.warehouseData} listData={this.state.clients} handleChange={this.handleChange} required={true}/>

              {/* INPUT: Warehouse name */}
              <TextInput label='Warehouse name' field='name' data={this.state.warehouseData} handleChange={this.handleChange} required={true} />

              {/* INPUT: Location */}
              <TextInput label='Location' field='location' data={this.state.warehouseData} handleChange={this.handleChange} />

              {/* INPUT: Timezone */}
              <TextInput label='Timezone' field='timezone' data={this.state.warehouseData} handleChange={this.handleChange} />

              {/* INPUT: Operational day start */}
              <TimeInput label='Operation Day Start (UTC)' field='opDayStart' data={this.state.warehouseData} handleChange={this.handleChange} required={true}/>

              {/* INPUT: Week start */}
              <SelectInput label='Week start' field='weekStart' data={this.state.warehouseData} listData={weekdays} handleChange={this.handleChange} required={true}/>

            <FormGroup row>
              <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.warehouseData.showEngagement}
                  onClick={ (event) => { this.handleChange('showEngagement', !this.state.warehouseData.showEngagement); }}
                  value={this.state.warehouseData.showEngagement}
                />
              }
              label='Show enagement'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.warehouseData.updateEngagement}
                  onClick={ (event) => { this.handleChange('updateEngagement', !this.state.warehouseData.updateEngagement); }}
                  value={this.state.warehouseData.updateEngagement}
                />
              }
              label='Update enagement'
            />
            <FormControlLabel
              control={
                <Checkbox
                checked={this.state.warehouseData.hideJudgement}
                onClick={ (event) => { this.handleChange('hideJudgement', !this.state.warehouseData.hideJudgement); }}
                value={this.state.warehouseData.hideJudgement}
                />
              }
              label='Hide safety score'
            />
            <FormControlLabel
              control={
                <Checkbox
                checked={this.state.warehouseData.displayNames}
                onClick={ (event) => { this.handleChange('displayNames', !this.state.warehouseData.displayNames); }}
                value={this.state.warehouseData.displayNames}
                />
              }
              label='Display names'
            />
          </FormGroup>
          </form>

        {
          // @ts-ignore
          <SettingsTab currentSettings={this.state.warehouseSettings} functions={{ handleChange: this.handleSettingsChange }} />
        }

      </SwipeableViews>
      <Divider />
        <div>
          <Button variant='contained' size='large' className={classes.button} onClick={this.saveData} disabled={this.state.isLoading}>
              <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Save Warehouse
          </Button>
          <Button variant='contained' size='large' className={classes.button} disabled={this.state.newWarehouse} onClick={this.confirmDelete}>
              <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Delete Warehouse
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

  private async validateForm() {
    let errors: string[];
    errors = [];
    errors = Utils._validateFields(this.state.warehouseData,
      {
       'id' : '^([0-9]+)',
       'clientId' : '^[^0]([0-9]+)',
       'opDayStart': '^([0-9]{2}[\:]{1}[0-9]{2})',
       'name': '()[^.]+',
      },
    );

    console.log('Form validation errors');
    console.log(errors);

    if (errors.length === 0) {
      return true; // no errors, so it's valid
    } else {
      return false; // there's at least one error
    }
  }

  private confirmDelete = async () => {
    this.setState({ isDeleteOpen: false });

    // await this.apiService.DeleteWarehouse(this.state.warehouseData.id);

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
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EditWarehouse));