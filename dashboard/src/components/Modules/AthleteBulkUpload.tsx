import React from 'react';
import  { Component }  from 'react';
// @ts-ignore
import { render } from 'react-dom';

// @ts-ignore
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Redirect } from 'react-router';

// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';
import { PageChangedActionCreator } from '../../actions/NavActions';

import styles from '../styles/AthleteBulkUpload';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import BackArrowIcon from '@material-ui/icons/ArrowBack';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MaterialTable from 'material-table';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckCircle from '@material-ui/icons/CheckCircle';

// services
import ApiService from '../../services/ApiService';
import SleepUtil from 'src/services/SleepUtil';

interface IProps {
  readonly currentPage: string;
  readonly currentFilters: any;
  // Actions
  currentPageChanged?: (currentPage: string) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
  activeStep: number;
  fileName: string;
  fileObj: any;
  validCSV: boolean;
  errors: Array<any>;
  athletesToInsert: Array<any>;
  athletesToUpdate: Array<any>;
  validatingCSV: boolean;
  uploadingCSV: boolean;
  uploadSuccess: boolean;
  toList: boolean;
  toLogin: boolean;
}

class AthleteBulkUpload extends Component<IProps, IState> {
  // @ts-ignore
  private apiService: ApiService;
  private columns = [
    {
      title: 'Insert/Update',
         // @ts-ignore
          render: rowData => {
            // @ts-ignore
            const id = rowData.Id;
            return (
              <div style={{ width: '100%', height: 40 }}>
                  {id === undefined || id === '' ? 'Insert' : 'Update'}
              </div>
            );
          },
      },
    {
      title: 'Client',
      field: 'Client Id',
    },
    {
      title: 'First name',
      field: 'First Name',
    },
    {
      title: 'Last name',
      field: 'Last Name',
    },
    {
      title: 'External ID',
      field: 'External Id',
    },
    {
      title: 'Hire date',
      field: 'Hire Date',
    },
    {
      title: 'Termination date',
      field: 'Termination Date',
    },
  ];

  constructor(props: IProps) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.state = {
      activeStep: 0,
      fileName: '',
      fileObj: undefined,
      validCSV: false,
      errors: [],
      athletesToInsert: [],
      athletesToUpdate: [],
      validatingCSV: false,
      uploadingCSV: false,
      uploadSuccess: false,
      toList: false,
      toLogin: false,
    };

    this.apiService = new ApiService({
      functions: {},
    });

    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleNext =  this.handleNext.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleBack = this.handleBack.bind(this);

    this.verifyCSV = this.verifyCSV.bind(this);
    this.uploadCSV = this.uploadCSV.bind(this);
  }

  async handleFileChange(files: any) {
    let fileToUpload = files[0];
    let fileName = fileToUpload.name;

    await this.setState({
      fileName: fileName,
      fileObj: fileToUpload,
    });
  }

  async verifyCSV() {
    await this.setState({validatingCSV: true});
    if (this.state.fileObj !== undefined) {
      let response = await this.apiService.VerifyAthleteCSV(this.state.fileObj);

      if (response !== undefined) {
        console.log(response);
        let validCSV = response[0];
        let errors = response[1];
        let athletesToInsert = response[2];
        let athletesToUpdate = response[3];

        await this.setState({
          validCSV: validCSV,
          errors: errors,
          athletesToInsert: athletesToInsert,
          athletesToUpdate: athletesToUpdate,
        });
      }
    }
    await this.setState({validatingCSV: false});
  }

  async uploadCSV() {
    await this.setState({ uploadingCSV: true });
    if (this.state.fileObj !== undefined) {
      let response = await this.apiService.UploadAthleteCSV(this.state.fileObj);

      if (response !== undefined) {
        console.log(response);
        // @ts-ignore
        if (response === true) {
          await this.setState({ uploadSuccess: true });
          await this.setState({ uploadingCSV: false });
          await SleepUtil.SleepAsync(5000);
          // await this.setState({toList: true});
        } else {
          await this.setState({uploadSuccess: false});
        }
      }
    }
    await this.setState({ uploadingCSV: false });
  }

  uploadForm() {
    // @ts-ignore
    const { classes } = this.props;

    return (
        <div className={classes.contentContainer}>
          <h2> Create and upload file </h2>
          <Divider />
          <h3>
            Download one of the CSV files below, save the file, and update it with new users in Excel:
          </h3>
          <ul>
            <li> <a href='https://apps.strongarmtech.com/public/templateWithoutData.csv'> File with headers only </a> </li>
            <li> <a href='https://apps.strongarmtech.com/public/templateWithData.csv'> File with headers and some sample users </a> </li>
          </ul>
          <br />
          <TextField
          label={'Filepath'}
          className={classes.textField}
          value={this.state.fileName}
          margin='normal'
          variant='outlined'
          type='text'
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          disabled
          />
          <input
            accept='text/csv'
            className={classes.input}
            id='outlined-button-file'
            type='file'
            onChange={ (e) => this.handleFileChange(e.target.files) }
          />
          <label htmlFor='outlined-button-file'>
            <Button variant='outlined' component='span' className={classes.button}>
              Select CSV
            </Button>
          </label>

            <Button variant='outlined' component='span' className={classes.button}
            onClick={() => { this.verifyCSV(); } }
            >
                Verify CSV
            </Button>

            {
              this.state.validatingCSV &&
              <CircularProgress className={classes.progress} size={50} />
            }

            <br />
            <Divider />
            {
              this.state.validCSV ?
              <div>
                <h3> The csv looks good, hit next... </h3>
                <CheckCircle fontSize='large' color='primary'/>
              </div>
              :
              <div>
                <h3> No valid CSV was uploaded </h3>
              </div>
            }
        </div>
    );
  }

  uploadTable() {
    // @ts-ignore
    const { classes } = this.props;

    return (
        <div className={classes.contentContainer}>
          <h2> Confirm athletes </h2>
          <Divider />
          <br />
          <MaterialTable
            columns={this.columns}
            data={ this.state.athletesToInsert.concat(this.state.athletesToUpdate) }
            title=''
            options={{pageSize: 5, toolbar: false, selection: false, filtering: false, search: false}}
          />
        </div>
    );
  }

  uploadAthletes() {
    // @ts-ignore
    const { classes } = this.props;

    return (
      <div className={classes.contentContainer}>
      <h2> Submit </h2>
      <Divider />
      <br />
        <Button variant='outlined' component='span' className={classes.button}
              onClick={() => { this.uploadCSV(); } }
              >
                  Upload CSV
        </Button>
        {
          this.state.uploadingCSV &&
          <CircularProgress className={classes.progress} size={50} />
        }

        {
          this.state.uploadSuccess &&
          <div>
            <h3> Athletes uploaded successfully, redirecting to athletes list in 5 seconds... </h3>
            <CheckCircle fontSize='large' color='primary'/>
          </div>
        }

    </div>
    );
  }

  getSteps() {
    return ['Select athletes', 'Confirm athletes', 'Submit'];
  }

  getStepContent() {
    switch (this.state.activeStep) {
      case 0:
        return this.uploadForm();
      case 1:
        return this.uploadTable();
      case 2:
        return this.uploadAthletes();
      default:
        return 'Unknown step';
    }
  }

  handleNext() {
    const activeStep = this.state.activeStep;
    this.setState({
      activeStep: activeStep + 1,
    });
  }

  handleReset() {
    this.setState({
      activeStep: 0,
    });
  }

  handleBack() {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  }

  componentDidMount() {
    console.log('AthleteBulkUpload component mounted');
    // @ts-ignore
    this.props.currentPageChanged('summary');
  }

  componentWillUnmount() {
    console.log('AthleteBulkUpload component unmounting');
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;
    const steps = this.getSteps();

    return (
       <div className={classes.tableContainer}>

           {
              this.state.toList &&
              <Redirect to='/athletes' />
            }

            {
              this.state.toLogin &&
              <Redirect to='/login' />
            }

        <Grid container spacing={24}>
          <Grid item xs={12}>
              <Link to='/athletes'>
                <IconButton className={classes.button} aria-label='Go Back'>
                  <BackArrowIcon />
                </IconButton>
              </Link>
              <br />
              <Divider />
              <Stepper activeStep={this.state.activeStep}>
                  { steps.map((label, index) => {
                    const props = {};
                    const labelProps = {};
                    return (
                      <Step key={label} {...props}>
                        <StepLabel {...labelProps}>{label}</StepLabel>
                      </Step>
                    );
                  })}
            </Stepper>
              <br />
              <div>
          {this.state.activeStep  === steps.length ? (
            <div>
              <Typography className={classes.instructions}>
                {this.uploadAthletes()}
              </Typography>
              <Divider />
              <div className={classes.stepNavigationContainer}>
                <Button onClick={this.handleReset} className={classes.button}>
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Typography className={classes.instructions}>{this.getStepContent()}</Typography>
              <Divider />
              <div className={classes.stepNavigationContainer}>
                <Button
                  disabled={this.state.activeStep === 0}
                  onClick={this.handleBack}
                  className={classes.button}
                >
                  Back
                </Button>
                { this.state.activeStep  !== steps.length - 1 && this.state.validCSV ?
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={this.handleNext}
                    className={classes.button}
                  >
                    Next
                  </Button>
                : undefined
                }
              </div>
            </div>
            )}
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }

}

function mapStateToProps(state: IStoreState): IProps {
  return {
    currentPage: state.currentPage,
    currentFilters: state.currentFilters,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    currentPageChanged: bindActionCreators(PageChangedActionCreator, dispatch),
  };
}

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AthleteBulkUpload));