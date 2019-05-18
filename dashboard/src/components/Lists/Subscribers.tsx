import React from 'react';
import  { Component }  from 'react';
// @ts-ignore
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
// import { Redirect } from 'react-router';
// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
// @ts-ignore
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';
import { PageChangedActionCreator } from '../../actions/NavActions';
import { FiltersChangedActionCreator } from '../../actions/FilterActions';
import { AuthStateChangeActionCreator } from '../../actions/AuthActions';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
// @ts-ignore
import { Container, Row, Col } from 'react-grid-system';
// import Button from '@material-ui/core/Button';
// import Paper from '@material-ui/core/Paper';
// import Grid from '@material-ui/core/Grid';
// import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
// @ts-ignore
import EditIcon from '@material-ui/icons/Edit';
import MaterialTable from 'material-table';
// import CloudUploadIcon from '@material-ui/icons/CloudUpload';
// import classNames from 'classnames';
// services
import ApiService from '../../services/ApiService';

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

interface IState {
  Clients: any;
  Value: number;
  open: boolean;
}

class Subscribers extends Component<IProps, IState> {

  private columns = [
    {
      title: 'First Name',
      field: 'first_name',
    },
    {
      title: 'Last Name',
      field: 'last_name',
    },
    {
      title: 'Phone',
      field: 'phone',
    },
    {
      title: 'Email',
      field: 'email',
    },
    {
    title: 'Actions',
     // @ts-ignore
      render: rowData => {
        // @ts-ignore
        const link = '/clients/edit/' + parseInt(rowData.id, 10);
        return (
          <div style={{ width: '100%', height: 40 }}>
                <Link to={link}>
                  <IconButton color='secondary' aria-label='Edit'>
                    <EditIcon fontSize='small'/>
                  </IconButton>
                </Link>
          </div>
        );
      },
    },
  ];

  private apiService: ApiService;

  constructor(props: IProps) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.state = {
      Clients: [],
      Value: 1,
      open: false,
    };

    this.handleAuthChange = this.handleAuthChange.bind(this);

    this.setClientList = this.setClientList.bind(this);
    this.addFilter = this.addFilter.bind(this);
    this.handleOpen = this.handleOpen.bind(this);

    this.apiService = new ApiService({
      functions: {
        'setList': this.setClientList,
        authChanged: this.handleAuthChange,
      },
    });

    this.apiService.getSubscribers();
  }

  async handleOpen() {
    await this.setState({open: !this.state.open});
  }

  async handleAuthChange(auth: any) {
    // @ts-ignore
    await this.props.authStateChanged(auth);
  }

  componentDidMount() {
    this.setClientList();
    console.log('ClientList component mounted');
    // @ts-ignore
    this.props.currentPageChanged('subscribers');
  }

  componentWillUnmount() {
    console.log('ClientList component unmounting');
  }

  public async setClientList() {
    let clients = await this.apiService.getSubscribers();
    console.log('clients', clients);
    this.setState({Clients: clients});
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;
    // if (this.props.auth.loggedIn === false) {
    //   return <Redirect to='/login' />; }
    return (
      <div style={styles.tableContainer}>
      <Grid container direction='row' justify='flex-start' spacing={0}>
      <Grid justify='space-between' alignItems='flex-start' item xs={12}>
          <Button onClick={this.handleOpen} style={{marginTop: 20, marginBottom: 20}} variant='contained' size='large'>
              Add Subscriber
          </Button>
          <Dialog open={this.state.open} onClose={this.handleOpen} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Email Address'
            type='email'
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleOpen} color='primary'>
            Cancel
          </Button>
          <Button onClick={this.handleOpen} color='primary'>
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
          </Grid>
          <Grid justify='space-between' alignItems='flex-start' item xs={12}>
          {/* <Button style={{marginTop: 20, marginBottom: 20}} variant='contained' size='large'>
              Import CSV
          </Button> */}
          </Grid>
          </Grid>
          <MaterialTable
          columns={this.columns}
          data={this.state.Clients}
          title='Subscribers'
          options={{
            pageSize: 10,
            selection: false,
            filtering: false,
          }}
        />
        {/* <div>
        <Button variant='contained' size='large' className={classes.button}
            onClick={() => console.log('click')}
          >
        <CloudUploadIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
          Upload
        </Button>
        </div> */}
      </div>
    );
  }

  private async addFilter(clientId: number) {
    let currentFilters = this.props.currentFilters;
    currentFilters.client.value = clientId;
    // @ts-ignore
    await this.props.currentFiltersChanged(currentFilters);

    this.props.history.push('/warehouses');
  }

}

function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    currentPage: state.currentPage,
    currentFilters: state.currentFilters,
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    currentPageChanged: bindActionCreators(PageChangedActionCreator, dispatch),
    currentFiltersChanged: bindActionCreators(FiltersChangedActionCreator, dispatch),
    authStateChanged: bindActionCreators(AuthStateChangeActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Subscribers);

// @ts-ignore
const styles = {
  tableContainer: {
    padding: 20,
    marginBottom: 50,
    paddingTop: 0,
    backgroundColor: 'white',
  },
  toolbarContainer: {
    backgroundColor: 'black',
    height: '10%vh',
  },
  navButton: {
    marginLeft: 1,
    backgroundColor: '#0B5897',
  },
  root: {
    flexGrow: 1,
  },
};