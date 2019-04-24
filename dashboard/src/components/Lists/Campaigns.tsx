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
// @ts-ignore
import { Container, Row, Col } from 'react-grid-system';

// @ts-ignore
import Button from '@material-ui/core/Button';
// import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
// @ts-ignore
import EditIcon from '@material-ui/icons/Edit';
import MaterialTable from 'material-table';

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
}

class Campaigns extends Component<IProps, IState> {

  private columns = [
    {
      title: 'Name',
      field: 'name',
    },
    {
      title: 'Date',
      field: 'date',
    },
    {
      title: 'Group',
      field: 'group',
    },
    {
      title: 'Status',
      field: 'status',
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
      Clients: [{'name': 'eli'}, {'name': 'ken'}],
      Value: 1,
    };

    this.handleAuthChange = this.handleAuthChange.bind(this);

    this.setClientList = this.setClientList.bind(this);
    this.addFilter = this.addFilter.bind(this);

    this.apiService = new ApiService({
      functions: {
        'setList': this.setClientList,
        authChanged: this.handleAuthChange,
      },
    });

    this.apiService.PopulateData('clients', this.props.currentFilters);
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

  render() {

    // if (this.props.auth.loggedIn === false) {
    //   return <Redirect to='/login' />; }
    return (
      <div style={styles.tableContainer}>
        <MaterialTable
          columns={this.columns}
          data={this.state.Clients}
          title='Campaigns'
          options={{pageSize: 20, selection: false, filtering: false}}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(Campaigns);

// @ts-ignore
const styles = {
  tableContainer: {
    padding: 20,
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