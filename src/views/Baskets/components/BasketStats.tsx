import React from 'react'
import { StatCard, StatsRow } from '../../../components/Stats'
import { Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Spacer from '../../../components/Spacer'
import { StyledBadge } from '../../../components/Badge'
import { decimate, getDisplayBalance } from '../../../utils/numberFormat'
import { SpinnerLoader } from '../../../components/Loader'
import { ActiveSupportedBasket } from '../../../bao/lib/types'
import { BigNumber } from 'bignumber.js'
import Tooltipped from '../../../components/Tooltipped'
import useNav from '../../../hooks/baskets/useNav'

type BasketStatsProps = {
	basket: ActiveSupportedBasket
	composition: any
	rates: any
	info: any
	pairPrice: BigNumber | undefined
}

const BasketStats: React.FC<BasketStatsProps> = ({
	basket,
	composition,
	rates,
	info,
	pairPrice,
}) => {
	const nav = useNav(composition, info && info.totalSupply)

	return (
		<StatsRow lg={4} sm={2}>
			<Col>
				<StatCard>
					<span>
						<FontAwesomeIcon icon="hand-holding-usd" />
						<br />
						Market Cap
					</span>
					<Spacer size={'sm'} />
					<StyledBadge bg="secondary">
						{rates && info ? (
							`$${getDisplayBalance(rates.usd.times(info.totalSupply), 36)}`
						) : (
							<SpinnerLoader />
						)}
					</StyledBadge>
				</StatCard>
			</Col>
			<Col>
				<StatCard>
					<span>
						<FontAwesomeIcon icon="coins" />
						<br />
						Supply
					</span>
					<Spacer size={'sm'} />
					<StyledBadge bg="secondary">
						{(info &&
							`${getDisplayBalance(info.totalSupply)} ${basket.symbol}`) || (
							<SpinnerLoader />
						)}
					</StyledBadge>
				</StatCard>
			</Col>
			<Col>
				<StatCard>
					<span>
						<FontAwesomeIcon icon="money-bill-wave" />
						<br />
						NAV{' '}
						<Tooltipped
							content={`The Net Asset Value is the value of one ${basket && basket.symbol} token if you were to own each underlying asset with identical weighting to the basket.`}
						/>
					</span>
					<Spacer size={'sm'} />
					<StyledBadge bg="secondary">
						{nav ? `$${getDisplayBalance(nav, 0)}` : <SpinnerLoader />}
					</StyledBadge>
				</StatCard>
			</Col>
			<Col>
				<StatCard>
					<span>
						<FontAwesomeIcon icon="angle-double-up" />
						<FontAwesomeIcon icon="angle-double-down" />
						<br />
						Premium{' '}
						<Tooltipped
							content={`Percent difference between the price on SushiSwap ($${
								pairPrice && pairPrice.toFixed(2)
							}) and the price to mint ($${
								rates && getDisplayBalance(rates.usd)
							})`}
						/>
					</span>
					<Spacer size={'sm'} />
					<StyledBadge bg="secondary">
						{pairPrice && rates ? (
							`${getDisplayBalance(
								pairPrice
									.minus(decimate(rates.usd))
									.abs()
									.div(decimate(rates.usd))
									.times(100),
								0,
							)}%`
						) : (
							<SpinnerLoader />
						)}
					</StyledBadge>
				</StatCard>
			</Col>
		</StatsRow>
	)
}

export default BasketStats
