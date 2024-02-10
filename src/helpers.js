export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
export const RED = 'danger'
export const GREEN = 'success'

export const DECIMALS = (10 ** 18)

export const ether = (wei) => {
    if(wei) {
        return (wei / DECIMALS)
    }
}

export const formatBalance = (balance) => {
    const precision = 100
    balance = ether(balance)
    balance = Math.round(balance * precision) / precision
    return balance
}

export const tokens = ether