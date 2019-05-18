import React from 'react';
import  { Component }  from 'react';
// @ts-ignore
import { Route, Link } from 'react-router-dom';
// @ts-ignore
import { Switch } from 'react-router-dom';
// @ts-ignore
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
// Import material styles and icons
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// @ts-ignore
import { Container, Row, Col } from 'react-grid-system';
// Import custom styles
import DashboardStyles from './styles/Dashboard';
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

class Settings extends Component<IProps, IState> {
  state = {
    open: true,
  };

  constructor(props: IProps) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  }

  handleDrawerClose = () => {
    this.setState({ open: false });
  }

  componentDidMount() {
    // this.props.currentPageChanged('settings');
    console.log(this.props.currentFilters);
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;
    return (
      // @ts-ignore
      <div>
          <Grid style={{padding: 50}} container direction='row' justify='center' alignItems='stretch' spacing={24}>
          <Grid justify='center' alignItems='center' item xs={3}>
          <Paper style={{padding: 20}}>
          <h4 style={{alignSelf: 'center'}}> Your Phone Number </h4>
          <h4 style={{alignSelf: 'center'}}>+1 (347) 302-4504</h4>
          </Paper>
          </Grid>
          </Grid>
      </div>
    );
  }
}

// @ts-ignore
Settings.propTypes = {
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(DashboardStyles)(Settings)));
