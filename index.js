/**
 * @format
 */

// Ganti path ini (hapus /src/)
import './polyfills';

// Ganti path ini juga (hapus /src/)
import App from './App';

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);