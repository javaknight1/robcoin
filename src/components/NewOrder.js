import React, { Component } from "react"
import { Tab, Tabs } from "react-bootstrap"
import { connect } from 'react-redux'
import { buyOrderAmountChanged, sellOrderAmountChanged, buyOrderPriceChanged, sellOrderPriceChanged } from "../store/actions"
import { makeBuyOrder, makeSellOrder } from "../store/interactions"
import { accountSelector, buyOrderSelector, exchangeSelector, sellOrderSelector, tokenSelector, web3Selector } from "../store/selectors"
import Spinner from "./Spinner"

const showForm = (props) => {
    const { dispatch, web3, account, exchange, token, buyOrder, sellOrder, showBuyTotal, showSellTotal } = props
    return(
        <Tabs defaultActiveKey="buy" className="bg-dark text-white">
            <Tab eventKey="buy" title="Buy" className="bg-dark">

                <form onSubmit={(event) => {
                    event.preventDefault()
                    makeBuyOrder(dispatch, web3, exchange, token, buyOrder, account)
                }}>
                    <div className="form-group small">
                        <label>Buy Amount (DAPP)</label>
                        <div className="input-group">
                            <input 
                                type="text"
                                className="form-control form-control-sm bg-dark text-white"
                                placeholder="Buy Amount"
                                onChange={(e) => dispatch(buyOrderAmountChanged(e.target.value))}
                                required/>
                        </div>
                    </div>
                    <div className="form-group small">
                        <label>Buy Price</label>
                        <div className="input-group">
                            <input 
                                type="text"
                                className="form-control form-control-sm bg-dark text-white"
                                placeholder="Buy Price"
                                onChange={(e) => dispatch(buyOrderPriceChanged(e.target.value))}
                                required/>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm btn-block">Buy Order</button>
                    { showBuyTotal ? <small>Total: {buyOrder.amount * buyOrder.price} ETH</small> : null }
                </form>
            </Tab>
            <Tab eventKey="sell" title="Sell" className="bg-dark">
            <form onSubmit={(event) => {
                    event.preventDefault()
                    makeSellOrder(dispatch, web3, exchange, token, sellOrder, account)
                }}>
                    <div className="form-group small">
                        <label>Sell Amount (DAPP)</label>
                        <div className="input-group">
                            <input 
                                type="text"
                                className="form-control form-control-sm bg-dark text-white"
                                placeholder="Sell Amount"
                                onChange={(e) => dispatch(sellOrderAmountChanged(e.target.value))}
                                required/>
                        </div>
                    </div>
                    <div className="form-group small">
                        <label>Sell Price</label>
                        <div className="input-group">
                            <input 
                                type="text"
                                className="form-control form-control-sm bg-dark text-white"
                                placeholder="Sell Price"
                                onChange={(e) => dispatch(sellOrderPriceChanged(e.target.value))}
                                required/>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm btn-block">Sell Order</button>
                    { showSellTotal ? <small>Total: {sellOrder.amount * sellOrder.price} ETH</small> : null }
                </form>
            </Tab>
        </Tabs>
    )
}

class NewOrder extends Component {
    render(){
        return(
            <div className="card bg-dark text-white">
            <div className="card-header">
              New Order
            </div>
            <div className="card-body">
                { this.props.showForm ? showForm(this.props) : <Spinner /> }
            </div>
          </div>
        )
    }
}

function mapStateToProps(state) {
    const buyOrder = buyOrderSelector(state)
    const sellOrder = sellOrderSelector(state)

    return {
        web3: web3Selector(state),
        account: accountSelector(state),
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        buyOrder,
        sellOrder,
        showForm: !buyOrder.making && !sellOrder.making,
        showBuyTotal: buyOrder.amount && buyOrder.price,
        showSellTotal: sellOrder.amount && sellOrder.price
    }
}
  
export default connect(mapStateToProps)(NewOrder);