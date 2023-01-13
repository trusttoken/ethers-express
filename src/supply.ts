import { connect } from './providers'
import { contracts } from './constants'

const [network, provider, wallet, contractAt] = connect()

// calculate circulating supply
export const getCirculatingSupply = async () => {
    const burned = await getBurned()
    const teamCirculating = await getTeamCirculating()
    const futureTeamCirculating = await getFutureTeamCirculating()
    const incentiveCirculating = await getIncentiveCirculating()
    const companyCirculating = await getCompanyCirculating()
    const preSale = await getPreSale()
    const protocolBalances = await getProtocolBalances()

    console.log('burned: '+burned)
    console.log('teamCirculating: '+teamCirculating)
    console.log('futureTeamCirculating: '+futureTeamCirculating)
    console.log('incentiveCirculating: '+incentiveCirculating)
    console.log('companyCirculating: '+companyCirculating)
    console.log('preSale: '+preSale)
    console.log('protocolBalances: '+protocolBalances)

    const circulatingSupply = -burned+teamCirculating+futureTeamCirculating+incentiveCirculating+companyCirculating+preSale-protocolBalances
    return circulatingSupply
}

// calculate total supply through tru contract
export const getTotalSupply = async () => {
    const TrustToken = contractAt('TrustToken', contracts.tru)
    const tru = await TrustToken.connect(wallet)
    const supply = await tru.totalSupply()/1e8
    return supply
}

// calculate burned as max supply - total supply
// burned from etherscan
export const getBurned = async () => {
    const supply = await getTotalSupply()
    const MAX_SUPPLY = 1450000000
    const burned = MAX_SUPPLY - supply
    return burned
}

const getTeamCirculating = async () => {
    const TOTAL_TEAM = 268250000

    const truContract = contractAt('TrustToken', contracts.tru)
    const grantedButNotUnlocked = await truContract.balanceOf(contracts.grantedButNotUnlocked)/1e8
    const options = await truContract.balanceOf(contracts.options)/1e8
    const teamCirculating = TOTAL_TEAM-grantedButNotUnlocked-options

    return teamCirculating
}

const getFutureTeamCirculating = async () => {
    const TOTAL_FUTURE_TEAM = 65250000

    const truContract = contractAt('TrustToken', contracts.tru)
    const futureTeam = await truContract.balanceOf(contracts.futureTeam)/1e8
    const futureTeamCirculating = TOTAL_FUTURE_TEAM-futureTeam
    return futureTeamCirculating
}

const getIncentiveCirculating = async () => {
    const TOTAL_INCENTIVE = 565500000

    const truContract = contractAt('TrustToken', contracts.tru)
    const BAL_BAL_TRU = await truContract.balanceOf(contracts.balBalTruDistributor)/1e8
    const UNI_ETH_TRU = await truContract.balanceOf(contracts.uniEthTruDistributor)/1e8
    const UNI_TUSD_LP = await truContract.balanceOf(contracts.uniTusdTfiDistributor)/1e8
    const TrueFi_LP = await truContract.balanceOf(contracts.tfiLpDistributor)/1e8
    const TRU_Voters = await truContract.balanceOf(contracts.creditMarketDistributor)/1e8
    const NXM = await truContract.balanceOf(contracts.nxmDistributor)/1e8
    const MULTISIG = await truContract.balanceOf(contracts.multisig)/1e8
    const STAKING_DISTRIBUTOR = await truContract.balanceOf(contracts.stakingDistributor)/1e8
    const STK_TRU_DISTRIBUTOR = await truContract.balanceOf(contracts.stkTruDistributor)/1e8
    const LIQ_GAUGE_DISTRIBUTOR = await truContract.balanceOf(contracts.liquidityGaugeDistributor)/1e8
    const PURCHASER_MULTISIG = await truContract.balanceOf(contracts.purchaserDistributionMultisig)/1e8

    const incentiveCirculating = TOTAL_INCENTIVE-BAL_BAL_TRU-UNI_ETH_TRU-UNI_TUSD_LP-TrueFi_LP-TRU_Voters-NXM-MULTISIG-STAKING_DISTRIBUTOR-STK_TRU_DISTRIBUTOR-LIQ_GAUGE_DISTRIBUTOR-PURCHASER_MULTISIG
    return incentiveCirculating
}
const getCompanyCirculating = async () => {
    const TOTAL_COMPANY = 163082598
    // subtract undistributed unlock balances
    const truContract = contractAt('TrustToken', contracts.tru)
    const UNDISTRIBUTED_UNLOCK_BALANCE_2021 = await truContract.balanceOf(contracts.companyUnlock2021)/1e8
    const UNDISTRIBUTED_UNLOCK_BALANCE_2022 = await truContract.balanceOf(contracts.companyUnlock2022)/1e8
    return TOTAL_COMPANY - UNDISTRIBUTED_UNLOCK_BALANCE_2021 - UNDISTRIBUTED_UNLOCK_BALANCE_2022
}

const getPreSale = async () => {
    const TOTAL_PRESALE = 387917402
    const TOTAL_UNLOCKS = 8

    const truContract = contractAt('TrustToken', contracts.tru)
    const toBeDistributed = await truContract.balanceOf(contracts.preSaleToBeDist)/1e8
    const registeredButUnclaimed = await truContract.balanceOf(contracts.preSaleRegisteredUnclaimed)/1e8
    const unclaimedMultiSig = await truContract.balanceOf(contracts.preSaleUnclaimedMultiSig)/1e8
    const alreadyDist = TOTAL_PRESALE-toBeDistributed-registeredButUnclaimed-unclaimedMultiSig

    const FIRST_RELEASE_DATE = Date.parse('21 Nov 2020 00:00:00 GMT')
    const releasePeriods = Math.ceil((Date.now()-FIRST_RELEASE_DATE)/(1000*60*60*24*30*3))
    const unlocks = Math.min(releasePeriods, TOTAL_UNLOCKS)
    const preSale = alreadyDist * unlocks/TOTAL_UNLOCKS

    return preSale
}

const getProtocolBalances = async () => {
    const truContract = contractAt('TrustToken', contracts.tru)
    const safuBalance = await truContract.balanceOf(contracts.safu)/1e8
    const communityTreasuryBalance = await truContract.balanceOf(contracts.communityTreasury)/1e8
    const protocolDaoTreasury = await truContract.balanceOf(contracts.protocolDaoTreasury)/1e8
    const incentivesDaoTreasury = await truContract.balanceOf(contracts.incentivesDaoTreasury)/1e8

    return safuBalance + communityTreasuryBalance + protocolDaoTreasury + incentivesDaoTreasury
}
