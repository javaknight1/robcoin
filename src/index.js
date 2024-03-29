import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App'
import configureStore from './store/configureStore'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
    <Provider store={configureStore()}>
        <App />
    </Provider>, 
    document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
serviceWorker.unregister()