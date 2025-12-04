// src/polyfills.ts
import ReactNativeBlobUtil from 'react-native-blob-util';

const polyfill = ReactNativeBlobUtil.polyfill;

// Supaya TypeScript nggak marah "Cannot find name 'global'"
declare const global: any;

global.XMLHttpRequest = polyfill.XMLHttpRequest;
global.Blob = polyfill.Blob;
