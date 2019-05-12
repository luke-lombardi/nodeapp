import React from 'react';
import  { Component }  from 'react';

// @ts-ignore
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
// import { Redirect } from 'react-router';

// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
// @ts-ignore
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';
import { PageChangedActionCreator } from '../../actions/NavActions';
import { FiltersChangedActionCreator } from '../../actions/FilterActions';
import { AuthStateChangeActionCreator } from '../../actions/AuthActions';
// import AppBar from '@material-ui/core/AppBar';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
// import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// @ts-ignore
import { Container, Row, Col } from 'react-grid-system';

// @ts-ignore
import Button from '@material-ui/core/Button';
// import AddIcon from '@material-ui/icons/Add';
// @ts-ignore
import EditIcon from '@material-ui/icons/Edit';
// import Campaigns from './Campaigns';

// services
import ApiService from '../../services/ApiService';
import Campaigns from './Campaigns';

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
  metrics: any;
}

class ClientList extends Component<IProps, IState> {

  private apiService: ApiService;

  constructor(props: IProps) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.state = {
      Clients: [],
      Value: 1,
      metrics: {
        opens: 20,
        sent: 102,
        subs: 4943,
      },
    };

    this.handleAuthChange = this.handleAuthChange.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.setClientList = this.setClientList.bind(this);
    this.addFilter = this.addFilter.bind(this);

    this.apiService = new ApiService({
      functions: {
        'setList': this.setClientList,
        authChanged: this.handleAuthChange,
      },
    });

    this.apiService.PopulateData();
  }

  async handleAuthChange(auth: any) {
    // @ts-ignore
    await this.props.authStateChanged(auth);
  }

  componentDidMount() {
    console.log('ClientList component mounted');
    // @ts-ignore
    this.props.currentPageChanged('clients');
  }

  componentWillUnmount() {
    console.log('ClientList component unmounting');
  }

  public async setClientList(clients: any) {
    await this.setState({Clients: clients});
  }

  handleChange = (event: any, value: number) => {
    console.log(value, event);
    this.setState({Value: value});
    //
  }

  renderTable() {
    switch (this.state.Value) {
      case 0:
        return <Campaigns />;
        break;
      case 1:
        return <Campaigns />;
        break;
      default:
    }
    return;
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;

    // const value = this.state;
    // if (this.props.auth.loggedIn === false) {
    //   return <Redirect to='/login' />; }
    return (
      // @ts-ignore
      <div style={styles.root}>
          <Grid style={{padding: 50}} container direction='row' justify='center' alignItems='stretch' spacing={24}>
          <Grid justify='center' alignItems='center' item xs={3}>
          <Paper style={{padding: 20}}>
          <h4 style={{alignSelf: 'center'}}> Sent Messages </h4>
          <h4 style={{alignSelf: 'center'}}>{this.state.metrics.sent}</h4>
          </Paper>
          </Grid>
          <Grid justify='center' alignItems='center' item xs={3}>
          <Paper style={{padding: 20, alignItems: 'center'}}>
          <h4 style={{alignSelf: 'center'}}> Opens </h4>
          <h4 style={{alignSelf: 'center'}}>{this.state.metrics.opens}</h4>
          </Paper>
          </Grid>
          <Grid justify='center' alignItems='center' item xs={3}>
          <Paper style={{padding: 20}}>
          <h4 style={{alignSelf: 'center'}}> Subscribers </h4>
          <h4 style={{alignSelf: 'center'}}>{this.state.metrics.subs}</h4>
          </Paper>
          </Grid>
          </Grid>
        <Row>
          <Col><Campaigns /></Col>
        </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(ClientList);

// @ts-ignore
const styles = {
  tableContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'white',
  },
  card: {
    minWidth: 275,
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
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: theme.palette.background.paper,
  },
};