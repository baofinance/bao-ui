import React from 'react'
import { StatCard, StatsRow } from '../../../components/Stats'
import { Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Spacer from '../../../components/Spacer'
import { StyledBadge } from '../../../components/Badge'
import { getDisplayBalance } from '../../../utils/numberFormat'
import { SpinnerLoader } from '../../../components/Loader'
import { ActiveSupportedBasket } from '../../../bao/lib/types'

type BasketStatsProps = {
	basket: ActiveSupportedBasket
	rates: any
	info: any
}

const BasketStats: React.FC<BasketStatsProps> = ({ basket, rates, info }) => {
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
						NAV
					</span>
					<Spacer size={'sm'} />
					<StyledBadge bg="secondary">~</StyledBadge>
				</StatCard>
			</Col>
			<Col>
				<StatCard>
					<span>
						<FontAwesomeIcon icon="angle-double-up" />
						<FontAwesomeIcon icon="angle-double-down" />
						<br />
						Premium
					</span>
					<Spacer size={'sm'} />
					<StyledBadge bg="secondary">~</StyledBadge>
				</StatCard>
			</Col>
		</StatsRow>
	)
}

export default BasketStats