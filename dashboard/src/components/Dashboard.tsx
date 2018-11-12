import React from 'react';
import  { Component }  from 'react';
import  { Fragment }  from 'react';

// @ts-ignore
import { Route, Link } from 'react-router-dom';
// @ts-ignore
import { Switch } from 'react-router-dom';
// @ts-ignore
import { withRouter } from 'react-router';

import PropTypes from 'prop-types';
import classNames from 'classnames';

// Import material styles and icons
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExitToAppIcon from '@material-ui/icons/ExitToAppOutlined';
import Chip from '@material-ui/core/Chip';
import ClientIcon from '@material-ui/icons/Business';
import WarehouseIcon from '@material-ui/icons/Home';
import GroupIcon from '@material-ui/icons/Group';

// import PeopleIcon from '@material-ui/icons/Person';
// import ShiftIcon from '@material-ui/icons/AccessTime';
// import JobFunctionIcon from '@material-ui/icons/Build';

// Import custom styles
import DashboardStyles from './styles/Dashboard';

// Common imports
import SideNav from './common/SideNav';
import PageActions from './common/PageActions';

// Modules
import Summary from './Modules/Summary';
import AthleteBulkUpload from './Modules/AthleteBulkUpload';

// Editors
import EditClient from './Editors/EditClient';
import EditWarehouse from './Editors/EditWarehouse';

// Lists
import ClientList from './Lists/ClientList';
import AthleteList from './Lists/AthleteList';
import GroupList from './Lists/GroupList';

// Import redux stuff
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';
import IStoreState from '../store/IStoreState';
import { PageChangedActionCreator } from '../actions/NavActions';
import { FiltersChangedActionCreator } from '../actions/FilterActions';

interface IProps {
  readonly currentPage: string;
  readonly currentFilters: any;

  // @ts-ignore
  history:  any;

  // Actions
  currentPageChanged?: (currentPage: string) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  currentFiltersChanged?: (currentFilters: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
}

class Dashboard extends Component<IProps, IState> {
  state = {
    open: true,
  };

  constructor(props: IProps) {
    super(props);

    this.removeFilter = this.removeFilter.bind(this);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.currentPageTitle = this.currentPageTitle.bind(this);
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  }

  handleDrawerClose = () => {
    this.setState({ open: false });
  }

  async removeFilter(filterType: string) {
    let currentFilters = this.props.currentFilters;

    switch (filterType) {
      case 'client':
        currentFilters.client.value = 0;
        break;
      case 'warehouse':
        currentFilters.warehouse.value = 0;
        break;
      default:
        console.log('Unhandled');
    }

    // @ts-ignore
    await this.props.currentFiltersChanged(currentFilters);

    window.location.reload();
  }

  componentDidMount() {
    console.log(this.props.currentFilters);
  }

  currentPageTitle() {
    let pageTitle = '';

    switch (this.props.currentPage) {
      case 'clients': pageTitle = 'Clients';
        break;
      case 'client_editor': pageTitle = 'Edit Client';
        break;
      case 'warehouses': pageTitle = 'Warehouses';
        break;
      default:
        console.log('Unhandled');
    }
    return pageTitle;
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;
    return (
      <Fragment>
        <CssBaseline />
        <div className={classes.root}>

          {/* START: Header container */}
          <AppBar
            position='absolute'
            className={classNames(classes.appBar, this.state.open && classes.appBarShift)}
          >
            <Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
              <IconButton
                color='inherit'
                aria-label='Open drawer'
                onClick={this.handleDrawerOpen}
                className={classNames(
                  classes.menuButton,
                  this.state.open && classes.menuButtonHidden,
                )}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component='h1'
                variant='h6'
                color='inherit'
                noWrap
                className={classes.title}
              >
              {this.currentPageTitle()}
              </Typography>
              {/* <Link to='/edit'> */}
                <IconButton color='inherit'>
                    <ExitToAppIcon />
                </IconButton>
              {/* </Link> */}
            </Toolbar>
          </AppBar>
          {/* END: Header container */}

          {/*  START: Side navbar */}
          <Drawer
            variant='permanent'
            classes={{
              paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
            }}
            open={this.state.open}
          >
              <div className={classes.toolbarIcon}>
                <IconButton onClick={this.handleDrawerClose}>
                  <ChevronLeftIcon />
                </IconButton>
              </div>

              <Divider />
                <List><SideNav/></List>
              <Divider />
              <List> <PageActions /> </List>

          </Drawer>
          {/*  END: Side navbar */}

          {/* START: Main content container */}
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <div className={classes.tableContainer}>

          {/* START: Filter toolbar (on bottom of screen under the list) */}
          <AppBar position='fixed' color='default' className={classes.filterAppBar}>
            <Toolbar className={classes.filterToolbar}>
                  {
                    this.props.currentFilters.client.value !== 0 &&
                    <Chip
                      icon={<ClientIcon />}
                      label={`Client ${this.props.currentFilters.client.value}`}
                      onDelete={() => { this.removeFilter('client'); } }
                      className={classes.chip}
                    />
                  }

                  {
                    this.props.currentFilters.warehouse.value !== 0 &&
                    <Chip
                      icon={<WarehouseIcon />}
                      label={`Warehouse ${this.props.currentFilters.warehouse.value}`}
                      onDelete={() => { this.removeFilter('warehouse'); } }
                      className={classes.chip}
                    />
                  }

                  {
                    this.props.currentFilters.group.value !== 0 &&
                    <Chip
                      icon={<GroupIcon />}
                      label={`Athletes in group ${this.props.currentFilters.group.value}`}
                      onDelete={() => { this.removeFilter('group'); } }
                      className={classes.chip}
                    />
                  }
            </Toolbar>
          </AppBar>
          {/* END: Filter toolbar (on bottom of screen under the list) */}

              {/* START: Define routes */}
              <Switch>
                   {
                   // @ts-ignore
                  <Route path='/login' component={() => window.location = '/'}/>
                   }

                  <Route exact path='/' component={ClientList} />

                  <Route exact path='/summary' component={Summary} />

                  <Route exact path='/clients' component={ClientList} />
                  <Route exact path='/clients/edit' component={EditClient} />
                  <Route exact path='/clients/edit/' component={EditClient} />
                  <Route path='/clients/edit/:clientId?' component={EditClient} />

                  <Route exact path='/warehouses/edit' component={EditWarehouse} />
                  <Route exact path='/warehouses/edit/' component={EditWarehouse} />
                  <Route path='/warehouses/edit/:warehouseId?' component={EditWarehouse} />

                  <Route exact path='/skills' component={AthleteList} />
                  <Route exact path='/groups' component={GroupList} />

              </Switch>
              {/* END: Define routes */}

            </div>
          </main>
          {/* END: Main content container */}

        </div>
      </Fragment>
    );
  }
}

// @ts-ignore
Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    currentPage: state.currentPage,
    currentFilters: state.currentFilters,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    currentPageChanged: bindActionCreators(PageChangedActionCreator, dispatch),
    currentFiltersChanged: bindActionCreators(FiltersChangedActionCreator, dispatch),
  };
}

// @ts-ignore
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(DashboardStyles)(Dashboard)));
