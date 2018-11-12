import IStoreState from '../store/IStoreState';

const InitialState: IStoreState = {
  //
  // Nav state
  //

  currentPage: 'clients',

  //
  // Filter state
  //
  currentFilters: {
    client: { type: 'client_id', value: 0, level: 0 },
    warehouse: { type:  'warehouse_id', value: 0, level: 1 },
    group: { type:  'group_id', value: 0, level: 2 },
    job_function: { type:  'job_function_id', value: 0, level: 2 },
  },

  //
  // Filter state
  //
  auth: {
    username: undefined,
    loggedIn: undefined,
  },

};

export default InitialState;