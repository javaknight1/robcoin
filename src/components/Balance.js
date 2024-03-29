import React, { Component } from "react"
import { Tabs, Tab } from "react-bootstrap"
import { connect } from 'react-redux'
import { 
    etherDepositAmountChanged, etherWithdrawAmountChanged,
    tokenDepositAmountChanged, tokenWithdrawAmountChanged } from "../store/actions"
import { loadBalances, 
    depositEther, withdrawEther,
    depositToken, withdrawToken } from '../store/interactions'
import { 
    accountSelector, 
    exchangeSelector, 
    tokenBalanceSelector, 
    tokenSelector, 
    etherBalanceSelector,
    exchangeEtherBalanceSelector,
    exchangeTokenBalanceSelector,
    web3Selector, 
    balancesLoadingSelector,
    etherDepositAmountSelector,
    etherWithdrawAmountSelector,
    tokenDepositAmountSelector,
    tokenWithdrawAmountSelector } from "../store/selectors"
import Spinner from "./Spinner"

const showForm = (props) => {
    const { dispatch,
        etherBalance, 
        tokenBalance, 
        exchangeEtherBalance, 
        exchangeTokenBalance,
        etherDepositAmount,
        etherWithdrawAmount,
        tokenDepositAmount,
        tokenWithdrawAmount,
        web3,
        exchange,
        token,
        account } = props
    return(
        <Tabs defaultActiveKey="deposit" className="bg-dark text-white">

        <Tab eventKey="deposit" title="Deposit" className="bg-dark">
          <table className="table table-dark table-sm small">
            <thead>
              <tr>
                <th>Token</th>
                <th>Wallet</th>
                <th>Exchange</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ETH</td>
                <td>{etherBalance}</td>
                <td>{exchangeEtherBalance}</td>
              </tr>
            </tbody>
          </table>
  
          <form className="row" onSubmit={(event) => {
            event.preventDefault()
            depositEther(dispatch, web3, exchange, etherDepositAmount, account)
          }}>
            <div className="col-12 col-sm pr-sm-2">
              <input
              type="text"
              placeholder="ETH Amount"
              onChange={(e) => dispatch(etherDepositAmountChanged(e.target.value)) }
              className="form-control form-control-sm bg-dark text-white"
              required />
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">
              <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
            </div>
          </form>

          <table className="table table-dark table-sm small">
            <tbody>
              <tr>
                <td>DAPP</td>
                <td>{tokenBalance}</td>
                <td>{exchangeTokenBalance}</td>
              </tr>
            </tbody>
          </table>

          <form className="row" onSubmit={(event) => {
            event.preventDefault()
            depositToken(dispatch, web3, exchange, token, tokenDepositAmount, account)
          }}>
            <div className="col-12 col-sm pr-sm-2">
              <input
              type="text"
              placeholder="DAPP Amount"
              onChange={(e) => dispatch(tokenDepositAmountChanged(e.target.value)) }
              className="form-control form-control-sm bg-dark text-white"
              required />
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">
              <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
            </div>
          </form>
  
        </Tab>
  
        <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
        <table className="table table-dark table-sm small">
            <thead>
              <tr>
                <th>Token</th>
                <th>Wallet</th>
                <th>Exchange</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ETH</td>
                <td>{etherBalance}</td>
                <td>{exchangeEtherBalance}</td>
              </tr>
            </tbody>
          </table>
  
          <form className="row" onSubmit={(event) => {
            event.preventDefault()
            withdrawEther(dispatch, web3, exchange, etherWithdrawAmount, account)
          }}>
            <div className="col-12 col-sm pr-sm-2">
              <input
              type="text"
              placeholder="ETH Amount"
              onChange={(e) => dispatch(etherWithdrawAmountChanged(e.target.value)) }
              className="form-control form-control-sm bg-dark text-white"
              required />
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">
              <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
            </div>
          </form>

          <table className="table table-dark table-sm small">
            <tbody>
              <tr>
                <td>DAPP</td>
                <td>{tokenBalance}</td>
                <td>{exchangeTokenBalance}</td>
              </tr>
            </tbody>
          </table>

          <form className="row" onSubmit={(event) => {
            event.preventDefault()
            withdrawToken(dispatch, web3, exchange, token, tokenWithdrawAmount, account)
          }}>
            <div className="col-12 col-sm pr-sm-2">
              <input
              type="text"
              placeholder="DAPP Amount"
              onChange={(e) => dispatch(tokenWithdrawAmountChanged(e.target.value)) }
              className="form-control form-control-sm bg-dark text-white"
              required />
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">
              <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
            </div>
          </form>
        </Tab>
      </Tabs>
    )
}

class Balance extends Component {
    componentWillMount() {
        this.loadBlockchainData(this.props)
    }

    async loadBlockchainData(props) {
        const { dispatch, web3, exchange, token, account } = props
        await loadBalances(dispatch, web3, exchange, token, account)
    }

    render(){
        return(
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Balance
                </div>
                <div className="card-body">
                    { this.props.showForm ? showForm(this.props) : <Spinner /> }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const balancesLoading = balancesLoadingSelector(state)

    return {
        token: tokenSelector(state),
        exchange: exchangeSelector(state),
        account: accountSelector(state),
        web3: web3Selector(state),
        etherBalance: etherBalanceSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        exchangeEtherBalance: exchangeEtherBalanceSelector(state),
        exchangeTokenBalance: exchangeTokenBalanceSelector(state),
        balancesLoading,
        showForm: !balancesLoading,
        etherDepositAmount: etherDepositAmountSelector(state),
        etherWithdrawAmount: etherWithdrawAmountSelector(state),
        tokenDepositAmount: tokenDepositAmountSelector(state),
        tokenWithdrawAmount: tokenWithdrawAmountSelector(state)
    }
}
  
export default connect(mapStateToProps)(Balance);