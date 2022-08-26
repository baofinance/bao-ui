import { faAngleDoubleDown, faAngleDoubleUp, faCoins, faHandHoldingUsd, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'bignumber.js'
import React from 'react'
import { isDesktop } from 'react-device-detect'

import Badge from '@/components/Badge'
import Card from '@/components/Card'
import Loader from '@/components/Loader'
import Tooltipped from '@/components/Tooltipped'
import useNav from '@/hooks/baskets/useNav'
import { getDisplayBalance } from '@/utils/numberFormat'

import { ActiveSupportedBasket } from '../../../bao/lib/types'

type BasketStatsProps = {
	basket: ActiveSupportedBasket
	composition: any
	rates: any
	info: any
	pairPrice: BigNumber | undefined
}

const BasketStats: React.FC<BasketStatsProps> = ({ basket, composition, rates, info, pairPrice }) => {
	const nav = useNav(composition, info && info.totalSupply)

	return (
		<div className={`mt-4 grid w-full grid-flow-col ${isDesktop ? 'grid-rows-1 gap-4' : 'grid-rows-2 gap-2'}`}>
			<Card>
				<Card.Body className='items-center justify-center text-center'>
					<div className='text-center'>
						<FontAwesomeIcon icon={faHandHoldingUsd} />
						<br />
						Market Cap
					</div>
					<Badge className='font-semibold'>
						{rates && info ? `$${getDisplayBalance(rates.usd.times(info.totalSupply), 36)}` : <Loader />}
					</Badge>
				</Card.Body>
			</Card>
			<Card>
				<Card.Body className='items-center justify-center text-center'>
					<div className='text-center'>
						<FontAwesomeIcon icon={faCoins} />
						<br />
						Supply
					</div>
					<Badge className='font-semibold'>{(info && `${getDisplayBalance(info.totalSupply)} ${basket.symbol}`) || <Loader />}</Badge>
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
					<Badge className='font-semibold'>{nav ? `$${getDisplayBalance(nav, 0)}` : <Loader />}</Badge>
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
							and the price to mint`}
						/>
					</div>
					<Badge className='font-semibold'>
						{pairPrice && rates ? (
							// `${getDisplayBalance(
							// 	pairPrice
							// 		.minus(decimate(rates.usd))
							// 		.abs()
							// 		.div(decimate(rates.usd))
							// 		.times(100),
							// 	0,
							// )}%`
							'-'
						) : (
							<Loader />
						)}
					</Badge>
				</Card.Body>
			</Card>
		</div>
	)
}

export default BasketStats
