import React from 'react';
import  { Component }  from 'react';

// @ts-ignore
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';
import { PageChangedActionCreator } from '../../actions/NavActions';

import styles from '../styles/Summary';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
// @ts-ignore
import Divider from '@material-ui/core/Divider';

// @ts-ignore
import CardContent from '@material-ui/core/CardContent';
// @ts-ignore
import MaterialTable from 'material-table';
import MainMap from '../common/MainMap';
import { TextInput } from '../Editors/common/Inputs';
// @ts-ignore
import LocationSearchInput from '../common/LocationInput';

// @ts-ignore
import PlacesAutocomplete from 'react-places-autocomplete';

// @ts-ignore
import Button from '@material-ui/core/Button';

// services
import ApiService from '../../services/ApiService';

interface IProps {
  readonly currentPage: string;
  readonly currentFilters: any;
  // Actions
  currentPageChanged?: (currentPage: string) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
  location: any;
}

class Summary extends Component<IProps, IState> {
  // @ts-ignore
  private apiService: ApiService;

  constructor(props: IProps) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    // this.eventList = this.eventList.bind(this);

    this.state = {
      location: {},
    };

  }

  componentDidMount() {
    console.log('Summary component mounted');
    // @ts-ignore
    this.props.currentPageChanged('summary');
  }

  componentWillUnmount() {
    console.log('Summary component unmounting');
  }

  // eventList() {
  //   return this.actions.map((e: any, index: number) =>
  //             (
  //                 <ExpansionPanel>
  //                   <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
  //                     <Typography>{e.header}</Typography>
  //                   </ExpansionPanelSummary>
  //                   <ExpansionPanelDetails>
  //                     <Typography>
  //                       {e.description}
  //                     </Typography>
  //                   </ExpansionPanelDetails>
  //                 </ExpansionPanel>
  //             ),
  //     );
  // }

  handleChange() {
    return '';
  }

  render() {
    // @ts-ignore
    const { classes } = this.props;

    return (
       <div className={classes.tableContainer}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
              <form className={classes.container} noValidate autoComplete='off'>
                {/* INPUT: Address */}
                <TextInput label='Service address' field='address' data={this.state.location} handleChange={this.handleChange}/>
                <MainMap />
                {/* <LocationSearchInput /> */}
              </form>
          </Grid>
        </Grid>
       </div>
    );
  }

}

function mapStateToProps(state: IStoreState): IProps {
  return {
    currentPage: state.currentPage,
    currentFilters: state.currentFilters,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    currentPageChanged: bindActionCreators(PageChangedActionCreator, dispatch),
  };
}

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Summary));