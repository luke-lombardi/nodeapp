import React, { Component }  from 'react';
import { Link } from 'react-router-dom';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';

// Import icons for sidebar
// import DashboardIcon from '@material-ui/icons/Dashboard';
// import WarehouseIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/Person';

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

  render() { return (
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
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary='Leads' />
    </ListItem>
    </Link>

    <Link to='/clients/edit'>
    <ListItem button>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
      <ListItemText primary='Add Lead' />
    </ListItem>
    </Link>

    {/* <Link to='/triggers'>
    <ListItem button>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary='Triggers' />
    </ListItem>
    </Link> */}

  </div>
  );
}
}

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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SideNav));
