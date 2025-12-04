/**
 * @format
 */

import './src/polyfills';   // impor duluan
import App from './src/App';
// ... regisdllterComponent 


import { AppRegistry } from 'react-native';
//import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);