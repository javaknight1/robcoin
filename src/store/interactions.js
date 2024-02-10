import Web3 from "web3"
import { 
    web3AccountLoaded, 
    web3Loaded, 
    tokenLoaded, 
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded,
    orderCancelling,
    orderCancelled,
    orderFilling,
    orderFilled, 
    etherBalanceLoaded,
    tokenBalanceLoaded,
    exchangeEtherBalanceLoaded,
    exchangeTokenBalanceLoaded,
    sellOrderMaking,
    buyOrderMaking,
    balancesLoaded, 
    balancesLoading, 
    orderMade} from "./actions"
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { ETHER_ADDRESS } from "../helpers"

export const loadWeb3 = (dispatch) => {
    const web3 = new Web3(window.ethereum)
    dispatch(web3Loaded(web3))
    return web3
}

export const loadAccount = async (web3, dispatch) => {
    const accounts = await web3.eth.getAccounts()
    dispatch(web3AccountLoaded(accounts[0]))
    return accounts[0]
}

export const loadToken = async (web3, networkId, dispatch) => {
    try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
        dispatch(tokenLoaded(token))
        return token
    } catch (error) {
        console.log("loadToken error: ", error)
    }
    
    return null
}

export const loadExchange = async (web3, networkId, dispatch) => {
    try {
        const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
        dispatch(exchangeLoaded(exchange))
        return exchange
    } catch (error) {
        console.log("loadExchange error: ", error)
    }
    
    return null
}

export const loadAllOrders = async (dispatch, exchange) => {
    const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
    const cancelledOrders = cancelStream.map((event) => event.returnValues)
    dispatch(cancelledOrdersLoaded(cancelledOrders))

    const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
    const filledOrders = tradeStream.map((event) => event.returnValues)
    dispatch(filledOrdersLoaded(filledOrders))

    const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
    const allOrders = orderStream.map((event) => event.returnValues)
    dispatch(allOrdersLoaded(allOrders))
}

export const subscribeToEvents = async (dispatch, web3, exchange, token, account) => {
    exchange.events.Cancel({}, (error, event) => {
        dispatch(orderCancelled(event.returnValues))
    })

    exchange.events.Trade({}, (error, event) => {
        dispatch(orderFilled(event.returnValues))
        loadBalances(dispatch, web3, exchange, token, account)
    })

    exchange.events.Deposit({}, (error, event) => {
        dispatch(balancesLoaded())
        loadBalances(dispatch, web3, exchange, token, account)
    })

    exchange.events.Withdraw({}, (error, event) => {
        dispatch(balancesLoaded())
        loadBalances(dispatch, web3, exchange, token, account)
    })

    exchange.events.Order({}, (error, event) => {
        dispatch(orderMade(event.returnValues))
        loadBalances(dispatch, web3, exchange, token, account)
    })
}

export const cancelOrder = (dispatch, exchange, order, account) => {
    exchange.methods.cancelOrder(order.id).send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(orderCancelling())
        })
        .on('error', (error) => {
            console.log(error)
            window.alert("Failed to cancel order on blockchain")
        })
}

export const fillOrder = (dispatch, exchange, order, account) => {
    exchange.methods.fillOrder(order.id).send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(orderFilling())
        })
        .on('error', (error) => {
            console.log(error)
            window.alert("Failed to cancel order on blockchain")
        })
}

export const loadBalances = async (dispatch, web3, exchange, token, account) => {
    const etherAmount = await web3.eth.getBalance(account)
    dispatch(etherBalanceLoaded(etherAmount))

    const tokenAmount = await token.methods.balanceOf(account).call()
    dispatch(tokenBalanceLoaded(tokenAmount))

    const exchangeEtherAmount = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
    dispatch(exchangeEtherBalanceLoaded(exchangeEtherAmount))

    const exchangeTokenAmount = await exchange.methods.balanceOf(token.options.address, account).call()
    dispatch(exchangeTokenBalanceLoaded(exchangeTokenAmount))

    dispatch(balancesLoaded())
}

export const depositEther = (dispatch, web3, exchange, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether')

    exchange.methods.depositEther().send({ from: account,  value: amount })
        .on('transactionHash', (hash) => {
            dispatch(balancesLoading())
        })
        .on('error',(error) => {
            console.error(error)
            window.alert(`There was an error!`)
        })
}

export const withdrawEther = (dispatch, web3, exchange, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether')

    exchange.methods.withdrawEther(amount).send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(balancesLoading())
        })
        .on('error',(error) => {
            console.error(error)
            window.alert(`There was an error!`)
        })
}

export const depositToken = (dispatch, web3, exchange, token, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether')

    console.log(token.method)
    token.methods.approve(exchange.options.address, amount).send({ from: account })
        .on('transactionHash', (hash) => {
            exchange.methods.depositToken(token.options.address, amount).send({ from: account })
            .on('transactionHash', (hash) => {
                dispatch(balancesLoading())
            })
            .on('error',(error) => {
                console.error(error)
                window.alert(`There was an error!`)
            })
        })
}

export const withdrawToken = (dispatch, web3, exchange, token, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether')

    exchange.methods.withdrawToken(token.options.address, amount).send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(balancesLoading())
        })
        .on('error',(error) => {
            console.error(error)
            window.alert(`There was an error!`)
        })
}

export const makeBuyOrder = (dispatch, web3, exchange, token, order, account) => {
    const tokenGet = token.options.address
    const amountGet = web3.utils.toWei(order.amount, 'ether')
    const tokenGive = ETHER_ADDRESS
    const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

    exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(buyOrderMaking())
        })
        .on('error',(error) => {
            console.error(error)
            window.alert(`There was an error!`)
        })
}

export const makeSellOrder = (dispatch, web3, exchange, token, order, account) => {
    const tokenGet = ETHER_ADDRESS
    const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')
    const tokenGive = token.options.address
    const amountGive = web3.utils.toWei(order.amount, 'ether')

    exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
        .on('transactionHash', (hash) => {
            dispatch(sellOrderMaking())
        })
        .on('error',(error) => {
            console.error(error)
            window.alert(`There was an error!`)
        })
}