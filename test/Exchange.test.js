import { EVM_REVERT, ETHER_ADDRESS } from './helpers';
import { tokens, ether } from './helpers';

const Token = artifacts.require('./Token');
const Exchange = artifacts.require('./Exchange');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
    let exchange;
    let token;
    const feePercent = 10;

    beforeEach(async () => {
        exchange = await Exchange.new(feeAccount, feePercent)

        token = await Token.new()
        token.transfer(user1, tokens(100), { from: deployer })
    });

    describe('deployment', () => {
        it('tracks the fee account', async () => {
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)
        });

        it('tracks the fee percent', async () => {
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        });
    })

    describe('fallback', () => {
        it('reverts when Ether is sent', async () => {
            await exchange.sendTransaction({ value: 1, from: user1 })
                .should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('depositing Ether', () => {
        let result
        let amount

        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositEther({ from: user1, value: amount })
        })

        it('tracks the Ether deposit', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal(amount.toString())
        })

        it('emits Deposit event', async () => {
            const log = result.logs[0]
            log.event.should.equal("Deposit")

            const event = log.args
            event.token.toString().should.equal(ETHER_ADDRESS, 'eth add is correct')
            event.user.toString().should.equal(user1, 'user is correct')
            event.amount.toString().should.equal(amount.toString(), 'amount is correct')
            event.balance.toString().should.equal(amount.toString(), 'balance  is correct')
        })
    })

    describe('withdrawing Ether', () => {
        let result
        let amount

        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositEther({ from: user1, value: amount })
        })

        describe('success', () => {
            beforeEach(async () => {
                result = await exchange.withdrawEther(amount, { from: user1 })
            })

            it('withdraw Ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')
            })

            it('emits Withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.equal("Withdraw")
    
                const event = log.args
                event.token.toString().should.equal(ETHER_ADDRESS, 'token is correct')
                event.user.toString().should.equal(user1, 'user is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance  is correct')
            })
        })

        describe('failure', () => {
            it('rejects withdraws for insufficient balance', async () => {
                await exchange.withdrawEther(ether(100), { from: user1 })
                    .should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('depositing tokens', () => {
        let result
        let amount

        describe('success', () => {

            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1 })
                result = await exchange.depositToken(token.address, amount, { from: user1 })
            })

            it('tracks token deposit', async () => {
                let balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())
                balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits Deposit event', async () => {
                const log = result.logs[0]
                log.event.should.equal("Deposit")
    
                const event = log.args
                event.token.toString().should.equal(token.address, 'token is correct')
                event.user.toString().should.equal(user1, 'user is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal(amount.toString(), 'balance  is correct')
            })
        })

        describe('failure', () => {
            it('rejects ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 })
                    .should.be.rejectedWith(EVM_REVERT)
            })

            it('fails when no tokens are approved', async () => {
                await exchange.depositToken(token.address, tokens(10), { from: user1 })
                    .should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('withdrawing tokens', () => {
        let result
        let amount

        describe('success', () => {

            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1 })
                await exchange.depositToken(token.address, amount, { from: user1 })

                result = await exchange.withdrawToken(token.address, amount, { from: user1 })
            })

            it('withdraw token funds', async () => {
                let balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal('0')
            })

            it('emits Withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.equal("Withdraw")
    
                const event = log.args
                event.token.toString().should.equal(token.address, 'token is correct')
                event.user.toString().should.equal(user1, 'user is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance  is correct')
            })
        })

        describe('failure', () => {
            it('rejects ether withdraw', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 })
                    .should.be.rejectedWith(EVM_REVERT)
            })

            it('fails for insufficient balance', async () => {
                await exchange.depositToken(token.address, tokens(10), { from: user1 })
                    .should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('checking balances', async () => {
        let amount

        beforeEach(async () => {
            amount = ether(1)
            exchange.depositEther({ from: user1, value: amount })
        })

        it('returns user balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
            result.toString().should.equal(amount.toString())
        })
    })

    describe('making orders', async () => {
        let result

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
        })

        it('tracks the newly created order', async () => {
            const orderCount = await exchange.orderCount()
            orderCount.toString().should.equal('1')

            const order = await exchange.orders('1')
            order.id.toString().should.equal('1', 'id is correct')
            order.user.toString().should.equal(user1, 'user is correct')
            order.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
            order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
            order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })

        it('emits an Order event', async () => {
            const log = result.logs[0]
            log.event.should.equal("Order")

            const order = log.args
            order.id.toString().should.equal('1', 'id is correct')
            order.user.toString().should.equal(user1, 'user is correct')
            order.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
            order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
            order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })
    })

    describe('order actions', async () => {

        beforeEach(async () => {
            await exchange.depositEther({ from: user1, value: ether(1) })

            await token.transfer(user2, tokens(100), { from: deployer })

            await token.approve(exchange.address, tokens(2), { from: user2 })
            await exchange.depositToken(token.address, tokens(2), { from: user2 })
            
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
        })

        describe('filling orders', () =>{
            describe('success', async () => {
                let result

                beforeEach(async () => {
                    result = await exchange.fillOrder('1', { from: user2 })
                })

                it('executes the trades and charges fees', async () => {
                    let balance = await exchange.balanceOf(token.address, user1)
                    balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens')

                    balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
                    balance.toString().should.equal(ether(1).toString(), 'user2 received Ether')

                    balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
                    balance.toString().should.equal('0', 'user2 Ether deducted')

                    balance = await exchange.balanceOf(token.address, user2)
                    balance.toString().should.equal(tokens(0.9).toString(), 'user2 tokens deducted with fee applied')

                    const feeAccount = await exchange.feeAccount()
                    balance = await exchange.balanceOf(token.address, feeAccount)
                    balance.toString().should.equal(tokens(0.1).toString(), 'feeAccount received fee')
                })

                it('updates filled orders', async () => {
                    const orderFilled = await exchange.orderFilled(1)
                    orderFilled.should.equal(true)
                })

                it('emits an Trade event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal("Trade")
        
                    const order = log.args
                    order.id.toString().should.equal('1', 'id is correct')
                    order.user.toString().should.equal(user1, 'user is correct')
                    order.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
                    order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
                    order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
                    order.userFill.toString().should.equal(user2, 'userFill is correct')
                    order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
                })
            })

            describe('failure', () => {
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 99999
                    await exchange.fillOrder(invalidOrderId, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects already filled orders', async () => {
                    await exchange.fillOrder('1', { from: user2 }).should.be.fulfilled
                    await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects cancelled orders', async () => {
                    await exchange.cancelOrder('1', { from: user1 }).should.be.fulfilled
                    await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })

        describe('cancelling order', () => {
            let result

            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.cancelOrder('1', { from: user1 })
                })

                it('updates cancelled orders', async () => {
                    const orderCancelled = await exchange.orderCancelled(1)
                    orderCancelled.should.equal(true)
                })

                it('emits an Cancel event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal("Cancel")
        
                    const order = log.args
                    order.id.toString().should.equal('1', 'id is correct')
                    order.user.toString().should.equal(user1, 'user is correct')
                    order.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
                    order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
                    order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
                    order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
                })
            })

            describe('failure', () => {
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999
                    await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects unauthorized cancelation', async () => {
                    await exchange.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })
    })
});