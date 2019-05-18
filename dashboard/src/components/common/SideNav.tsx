import React, { Component }  from 'react';
import { Link } from 'react-router-dom';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import Badge from '@material-ui/core/Badge';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DashboardStyles from '../styles/Dashboard';

// Import icons for sidebar
import DashboardIcon from '@material-ui/icons/Dashboard';
import WarehouseIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/Person';
import ThreeDRotation from '@material-ui/icons/ThreeDRotation';

// @ts-ignore
import { withRouter } from 'react-router';

// Import redux stuff
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
// @ts-ignore
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';

interface IProps {
}

interface IState {
}

class SideNav extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    // @ts-ignore
    return (
    <div>

    {/* <Link to='/summary'>
    <ListItem button>
      <ListItemIcon>
        <WarehouseIcon />
      </ListItemIcon>
      <ListItemText primary='Location' />
    </ListItem>
    </Link> */}

    <Link to='/clients'>
    <ListItem button>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary='Dashboard' />
    </ListItem>
    </Link>

    <Link to='/clients/edit'>
    <ListItem button>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
      <ListItemText primary='New Message' />
    </ListItem>
    </Link>

    <Link to='/subscribers'>
    <ListItem button>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary='Subscribers' />
    </ListItem>
    </Link>

    <Link to='/conversations'>
    <ListItem button>
      <ListItemIcon>
      <Badge badgeContent={4} color='primary'>
        <WarehouseIcon />
      </Badge>
      </ListItemIcon>
      <ListItemText primary='Replies' />
    </ListItem>
    </Link>

    <Link to='/settings'>
    <ListItem button>
      <ListItemIcon>
        <ThreeDRotation />
      </ListItemIcon>
      <ListItemText primary='Settings' />
    </ListItem>
    </Link>

  </div>
    );
  }
}

// @ts-ignore
SideNav.propTypes = {
  classes: PropTypes.object.isRequired,
};

function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

// @ts-ignore
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(DashboardStyles)(SideNav)));
