import React from 'react';
import  { Component }  from 'react';

// @ts-ignore
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Redirect } from 'react-router';

// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
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
import FilterIcon from '@material-ui/icons/FilterList';

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
  Groups: any;
}

class GroupList extends Component<IProps, IState> {

  // @ts-ignore
  private columns = [
    {
      title: 'ID',
      field: 'id',
    },
    {
      title: 'Title',
      field: 'title',
    },
    {
      title: 'description',
      field: 'description',
    },
    {
    title: 'Actions',
     // @ts-ignore
      render: rowData => {
        const id = rowData.id;
        return (
          <div style={{ width: '100%', height: 40 }}>
                <IconButton color='secondary' aria-label='Filter'
                  onClick={ () => { this.addFilter(id); } }
                >
                    <FilterIcon fontSize='small'/>
                </IconButton>
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
      Groups: [],
    };

    this.handleAuthChange = this.handleAuthChange.bind(this);

    this.setGroupList = this.setGroupList.bind(this);
    this.addFilter = this.addFilter.bind(this);

    this.apiService = new ApiService({
      functions: {
        'setList': this.setGroupList,
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
    console.log('ShiftList component mounted');

    // @ts-ignore
    this.props.currentPageChanged('groups');
  }

  componentWillUnmount() {
    console.log('ShiftList component mounted');
  }

  public async setGroupList(groups: any) {
    await this.setState({Groups: groups});
  }

  render() {
    if (this.props.auth.loggedIn === false) {
      return <Redirect to='/login' />; }

    return (
       <div style={styles.tableContainer}>
        <MaterialTable
          columns={this.columns}
          data={this.state.Groups}
          title='Groups'
          options={{pageSize: 20, selection: true, filtering: true}}
        />
      </div>
    );
  }

  private async addFilter(groupId: number) {
    let currentFilters = this.props.currentFilters;
    currentFilters.group.value = groupId;
    // @ts-ignore
    await this.props.currentFiltersChanged(currentFilters);

    this.props.history.push('/groups');
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

export default connect(mapStateToProps, mapDispatchToProps)(GroupList);

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
  navButtonContainer: {

  },
};