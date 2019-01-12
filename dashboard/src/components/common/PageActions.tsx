import React, { Component }  from 'react';
// import { Link } from 'react-router-dom';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// @ts-ignore
import ListSubheader from '@material-ui/core/ListSubheader';

// Import icons for sidebar
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import UploadIcon from '@material-ui/icons/CloudUpload';
import DownloadIcon from '@material-ui/icons/CloudDownload';

// @ts-ignore
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

// Import redux stuff
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
// @ts-ignore
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';

interface IProps {
  readonly currentPage: string;
  readonly currentFilters: any;

  // @ts-ignore
  history:  any;
}

interface IState {
}

class PageActions extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  clientActions() {
    return (
      <div>
      {/* <ListSubheader inset>Actions</ListSubheader>
      <Link to='/clients/edit'>
        <ListItem button>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary='Add client' />
        </ListItem>
      </Link> */}
      {/* <ListItem button>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary='Delete selected' />
      </ListItem> */}
    </div>
    );
  }

  warehouseActions() {
    return (
      <div>
      <ListSubheader inset>Actions</ListSubheader>
      <Link to='/warehouses/edit'>
        <ListItem button>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary='Add warehouse' />
        </ListItem>
      </Link>
      {/* <ListItem button>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary='Delete selected' />
      </ListItem> */}
    </div>
    );
  }

  athleteActions() {
    return (
      <div>
      <ListSubheader inset>Actions</ListSubheader>
      <Link to='/athletes/edit'>
      <ListItem button>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary='Add athlete' />
      </ListItem>
      </Link>
      <ListItem button>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary='Delete selected' />
      </ListItem>
      <Link to='/athletes/upload'>
      <ListItem button>
        <ListItemIcon>
          <UploadIcon />
        </ListItemIcon>
        <ListItemText primary='Bulk upload' />
      </ListItem>
      </Link>
      <Link to='/athletes/export'>
      <ListItem button>
        <ListItemIcon>
          <DownloadIcon />
        </ListItemIcon>
        <ListItemText primary='Export selected' />
      </ListItem>
      </Link>
    </div>
    );
  }

  dockActions() {
    return (
      <div>
      <ListSubheader inset>Actions</ListSubheader>
      <Link to='/docks/configure'>
        <ListItem button>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary='Configure Docks' />
        </ListItem>
      </Link>
    </div>
    );
  }

  render() {
    switch (this.props.currentPage) {
      case 'clients':
        return this.clientActions();
        break;
      case 'warehouses':
        return this.warehouseActions();
        break;
      case 'athletes':
        return this.athleteActions();
        break;
      case 'docks':
        return this.dockActions();
        break;
      default:
        return (<div> </div> );
    }
  }
}

function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    currentPage: state.currentPage,
    currentFilters: state.currentFilters,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

// @ts-ignore
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PageActions));
