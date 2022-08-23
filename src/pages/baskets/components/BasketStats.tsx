import { StyledBadge } from '@/components/Badge/Badge'
import Card from '@/components/Card'
import Loader from '@/components/Loader'
import Tooltipped from '@/components/Tooltipped'
import useNav from '@/hooks/baskets/useNav'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faAngleDoubleDown, faAngleDoubleUp, faCoins, faHandHoldingUsd, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'bignumber.js'
import React from 'react'
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
		<div className='grid w-full grid-flow-col gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			<div className='flex flex-col'>
				<Card>
					<Card.Body className='items-center justify-center text-center'>
						<div className='text-center'>
							<FontAwesomeIcon icon={faHandHoldingUsd} />
							<br />
							Market Cap
						</div>
						<StyledBadge>{rates && info ? `$${getDisplayBalance(rates.usd.times(info.totalSupply), 36)}` : <Loader />}</StyledBadge>
					</Card.Body>
				</Card>
			</div>
			<div className='flex flex-col'>
				<Card>
					<Card.Body className='items-center justify-center text-center'>
						<div className='text-center'>
							<FontAwesomeIcon icon={faCoins} />
							<br />
							Supply
						</div>
						<StyledBadge>{(info && `${getDisplayBalance(info.totalSupply)} ${basket.symbol}`) || <Loader />}</StyledBadge>
					</Card.Body>
				</Card>
			</div>
			<div className='flex flex-col'>
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
						<StyledBadge>{nav ? `$${getDisplayBalance(nav, 0)}` : <Loader />}</StyledBadge>
					</Card.Body>
				</Card>
			</div>
			<div className='flex flex-col'>
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
						<StyledBadge>
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
						</StyledBadge>
					</Card.Body>
				</Card>
			</div>
		</div>
	)
}

export default BasketStats
