import { faAngleDoubleDown, faAngleDoubleUp, faCoins, faHandHoldingUsd, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'ethers'
import React from 'react'
import { isDesktop } from 'react-device-detect'

import BN from 'bignumber.js'

import Badge from '@/components/Badge'
import Card from '@/components/Card'
import Loader from '@/components/Loader'
import Tooltipped from '@/components/Tooltipped'
import useNav from '@/hooks/baskets/useNav'
import { getDisplayBalance } from '@/utils/numberFormat'
//import { formatUnits, parseUnits } from 'ethers/lib/utils'

import type { BasketComponent } from '@/hooks/baskets/useComposition'
import type { BasketRates } from '@/hooks/baskets/useBasketRate'
import type { BasketInfo } from '@/hooks/baskets/useBasketInfo'
import { ActiveSupportedBasket } from '@/bao/lib/types'

type BasketStatsProps = {
	basket: ActiveSupportedBasket
	composition: BasketComponent[]
	rates?: BasketRates
	info?: BasketInfo
	pairPrice?: BigNumber
}

const BasketStats: React.FC<BasketStatsProps> = ({ basket, composition, rates, info, pairPrice }) => {
	const nav = useNav(composition, info ? info.totalSupply : BigNumber.from(0))

	// INFO: use bignumber.js because the premium can be negative
	let premium = null
	let premiumColor = 'white'
	if (nav && pairPrice && rates) {
		premium = new BN(nav.toString()).minus(rates.usd.toString()).div(rates.usd.toString()).times(100)
		premiumColor = premium.isNegative() ? 'red' : 'green'
	}

	let marketCap
	if (rates && info) {
		marketCap = rates.usd.mul(info.totalSupply).div(BigNumber.from(10).pow(18))
	}

	return (
		<div className={`mt-4 grid w-full grid-flow-col ${isDesktop ? 'grid-rows-1 gap-4' : 'grid-rows-2 gap-2'}`}>
			<Card>
				<Card.Body className='items-center justify-center text-center'>
					<div className='text-center'>
						<FontAwesomeIcon icon={faHandHoldingUsd} />
						<br />
						Market Cap
					</div>
					<Badge className='font-semibold'>{marketCap ? `$${getDisplayBalance(marketCap)}` : <Loader />}</Badge>
				</Card.Body>
			</Card>
			<Card>
				<Card.Body className='items-center justify-center text-center'>
					<div className='text-center'>
						<FontAwesomeIcon icon={faCoins} />
						<br />
						Supply
					</div>
					<Badge className='font-semibold'>{info ? `${getDisplayBalance(info.totalSupply)} ${basket.symbol}` : <Loader />}</Badge>
				</Card.Body>
			</Card>
			<Card>
				<Card.Body className='items-center justify-center text-center'>
					<div className='text-center'>
						<FontAwesomeIcon icon={faMoneyBillWave} />
						<br />
						NAV{' '}
						<Tooltipped
							content={`The Net Asset Value is the value of one ${
								basket && basket.symbol
							} token if you were to own each underlying asset with identical weighting to the basket.`}
							placement='top'
						/>
					</div>
					<Badge className='font-semibold'>{nav ? `$${getDisplayBalance(nav)}` : <Loader />}</Badge>
				</Card.Body>
			</Card>
			<Card>
				<Card.Body className='items-center justify-center text-center'>
					<div className='text-center'>
						<FontAwesomeIcon icon={faAngleDoubleUp} />
						<FontAwesomeIcon icon={faAngleDoubleDown} />
						<br />
						Premium{' '}
						<Tooltipped
							content={`Percent difference between the price on exchange 
							and the price to mint.`}
						/>
					</div>
					<Badge className={`font-semibold text-${premiumColor}`}>{premium ? `${premium.toFixed(4)}%` : <Loader />}</Badge>
				</Card.Body>
			</Card>
		</div>
	)
}

export default BasketStats
