import React, { Component } from "react";
import { connect } from 'react-redux';
import { loadAllOrders, subscribeToEvents } from "../store/interactions";
import { accountSelector, exchangeSelector, tokenSelector, web3Selector } from "../store/selectors";

import Trades from './Trades';
import OrderBook from './OrderBook';
import MyTransactions from "./MyTransactions";
import PriceChart from "./PriceChart";
import Balance from "./Balance";
import NewOrder from "./NewOrder";

class Content extends Component {
    componentWillMount() {
        this.loadBlockchainData(this.props)
    }

    async loadBlockchainData(props) {
      const { dispatch, web3, exchange, token, account } = props

      await loadAllOrders(dispatch, exchange)
      await subscribeToEvents(dispatch, web3, exchange, token, account)
    }

    render() {
        return (
            <div className="content">
            <div className="vertical-split">
              <Balance />
              <NewOrder />
            </div>
            <div className="vertical">
              <OrderBook />
            </div>
            <div className="vertical-split">
              <PriceChart />
              <MyTransactions />
            </div>
            <div className="vertical">
              <Trades />
            </div>
          </div>)
    }
}

function mapStateToProps(state) {
    return {
        web3: web3Selector(state),
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        account: accountSelector(state)
    }
}
  
export default connect(mapStateToProps)(Content);