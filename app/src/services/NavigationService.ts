import { NavigationActions, StackActions} from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  const navAction = StackActions.navigate({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: routeName, params })],
  });

  _navigator.dispatch(navAction);
}

function reset(routeName, params) {
  const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: routeName, params })],
  });

  _navigator.dispatch(resetAction);
}

// add other navigation functions that you need and export them

export default {
  navigate,
  reset,
  setTopLevelNavigator,
};