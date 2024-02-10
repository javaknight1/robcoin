import React, { Component } from 'react';
import './App.css';
import { loadAccount, loadToken, loadExchange, loadWeb3 } from '../store/interactions';
import { connect } from 'react-redux';
import { contractsLoadedSelector } from '../store/selectors';

import Navbar from './Navbar';
import Content from './Content';

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = loadWeb3(dispatch)
    await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3, dispatch)
    const token = await loadToken(web3, networkId, dispatch)
    if (!token) {
      window.alert("Token Contract could not be loaded from current network. Please select another network with Metamask.")
    }
    const exchange = await loadExchange(web3, networkId, dispatch)
    if (!exchange) {
      window.alert("Exchange Contract could not be loaded from current network. Please select another network with Metamask.")
    }
    //const totalSupply = await token.methods.totalSupply().call()
  }

  render() {
    return (
      <div>
        <Navbar />
        { this.props.contractsLoaded? <Content /> : <div className='content'></div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App);
