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
import { AuthStateChangeActionCreator } from '../../actions/AuthActions';

// @ts-ignore
import { Container, Row, Col } from 'react-grid-system';

// @ts-ignore
import Button from '@material-ui/core/Button';
// import AddIcon from '@material-ui/icons/Add';
// import IconButton from '@material-ui/core/IconButton';
// import EditIcon from '@material-ui/icons/Edit';
// import MaterialTable from 'material-table';

// services
import ApiService from '../../services/ApiService';

interface IProps {
  readonly currentPage: string;
  readonly currentFilters: any;
  readonly auth: any;
  // Actions
  currentPageChanged?: (currentPage: string) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  authStateChanged?: (auth: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
  Skills: any;
}

class SkillList extends Component<IProps, IState> {

  private apiService: ApiService;

  constructor(props: IProps) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.state = {
      Skills: [],
    };

    this.setAthletesList = this.setAthletesList.bind(this);
    this.handleAuthChange = this.handleAuthChange.bind(this);

    // Make any API calls through the API service
    this.apiService = new ApiService({
      functions: {
        'setList': this.setAthletesList,
        authChanged: this.handleAuthChange,
      },
    });

    this.apiService.PopulateData('athletes', this.props.currentFilters);
  }

  async handleAuthChange(auth: any) {
    // @ts-ignore
    await this.props.authStateChanged(auth);
  }

  componentDidMount() {
    console.log('AthleteList component mounted');
    // @ts-ignore
    this.props.currentPageChanged('athletes');
  }

  componentWillUnmount() {
    console.log('AthleteList component unmounting');
  }

  public async setAthletesList(athletes: any) {
    // await this.setState({Athletes: athletes});
  }

  render() {
    if (this.props.auth.loggedIn === false) {
      return <Redirect to='/login' />; }

    return (
       <div style={styles.tableContainer}>
      </div>
    );
  }

}

function mapStateToProps(state: IStoreState): IProps {
  return {
    currentPage: state.currentPage,
    currentFilters: state.currentFilters,
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    currentPageChanged: bindActionCreators(PageChangedActionCreator, dispatch),
    authStateChanged: bindActionCreators(AuthStateChangeActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SkillList);

// @ts-ignore
const styles = {
  tableContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'white',
    paddingBottom: 100,
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