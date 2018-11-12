import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// @ts-ignore
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

// @ts-ignore
import { configureStore, History } from './store/ConfigureStore';
import { ConfigGlobalLoader } from './services/config/ConfigGlobal';

import { BrowserRouter } from 'react-router-dom';

import Dashboard from './components/Dashboard';
import './styles/index.css';
import registerServiceWorker from './registerServiceWorker';

const store = configureStore();

const configGlobal = ConfigGlobalLoader.config;

// This allows versioned URLs to redirect to the proper route, before the app is targeted
function getRootPath(rootPath: any) {
  let versionRegex = /([0-9]+\.[0-9]+\.[0-9]+)/;
  let currentURL = window.location.href;
  let match = currentURL.match(versionRegex);
  if (match !== null) {
    rootPath += match[1] + '/';
  }
  return rootPath;
}

// const theme = createMuiTheme({
//     overrides: {
//       MuiInput: {
//         underline: {
//           '&:before': {
//             backgroundColor: 'red',
//           },
//           '&:hover:not($disabled):before': {
//             backgroundColor: 'green',
//           },
//         },
//       },
//     },
//   },
// );
// @ts-ignore
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
});

ReactDOM.render(
  // <MuiThemeProvider theme={theme}>
    <Provider store={store}>
        <BrowserRouter basename={getRootPath(configGlobal.rootPath)}>
          <Dashboard />
        </BrowserRouter>
    </Provider>
  // </MuiThemeProvider>
  ,
  document.getElementById('root') as HTMLElement,
);
registerServiceWorker();
