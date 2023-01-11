import { connect } from './providers'
import { contracts } from './constants'
import { BigNumber, Contract, constants } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

const [network, provider, wallet, contractAt] = connect()

const LOCKED_SUPPLY_ADDRESSES = [
    contracts.protocolDaoTreasury,
    contracts.incentivesDaoTreasury,
    contracts.stakingDistributor,
    contracts.stkTruDistributor,
    contracts.liquidityGaugeDistributor,
    contracts.nxmDistributor,
    contracts.options,
    contracts.futureTeam,
    contracts.preSaleUnclaimedMultiSig,
    contracts.preSaleRegisteredUnclaimed,
]

export const getCirculatingSupply = async (): Promise<number> => {
    const truContract = getTruContract()
    const decimals = await truContract.decimals()
    const totalSupply = await getTotalSupply(truContract)
    const lockedSupply = await getLockedSupply(truContract)
    const circulatingSupplyBN = totalSupply.sub(lockedSupply)

    return parseFloat(formatUnits(circulatingSupplyBN, decimals))
}

const getTruContract = (): Contract => {
    const TrustToken = contractAt('TrustToken', contracts.tru)
    return TrustToken.connect(wallet)
}

const getTotalSupply = async (truContract: Contract): Promise<BigNumber> => {
    return await truContract.totalSupply()
}

const getLockedSupply = async (truContract: Contract): Promise<BigNumber> => {
    const queries = LOCKED_SUPPLY_ADDRESSES.map(address => truContract.balanceOf(address))
    const lockedBalances = await Promise.all(queries)

    return lockedBalances.reduce((prevValue, currValue) => {
        return prevValue.add(currValue)
    }, constants.Zero)
}