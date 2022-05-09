import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import useBaskets from '../../hooks/baskets/useBaskets'
import useBasketRates from '../../hooks/baskets/useNestRate'
import useComposition from '../../hooks/baskets/useComposition'
import useBasketInfo from '../../hooks/baskets/useBasketInfo'
import PageHeader from '../../components/PageHeader'
import Page from 'components/Page'
import { Container } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getDisplayBalance } from '../../utils/numberFormat'
import { SpinnerLoader } from '../../components/Loader'
import { StyledBadge } from 'components/Badge'
import Composition from './components/Composition'
import BasketButtons from './components/BasketButtons'
import BasketStats from './components/BasketStats'
import usePairPrice from '../../hooks/baskets/usePairPrice'

const Basket: React.FC = () => {
	const { id } = useParams()
	const baskets = useBaskets()

	const basket = useMemo(
		() => baskets && baskets.find((basket) => basket.nid.toString() === id),
		[baskets],
	)
	const composition = useComposition(basket)
	const rates = useBasketRates(basket)
	const info = useBasketInfo(basket)
	const pairPrice = usePairPrice(basket)

	return (
		<Page>
			<PageHeader
				icon=""
				title={basket && basket.name}
				subtitle={
					<StyledBadge>
						{rates ? (
							<>
								<FontAwesomeIcon icon={['fab', 'ethereum']} />{' '}
								{getDisplayBalance(rates.eth)}{' '}
								<FontAwesomeIcon icon="angle-double-right" />{' '}
								{`$${getDisplayBalance(rates.usd)}`}
							</>
						) : (
							<SpinnerLoader />
						)}
					</StyledBadge>
				}
			/>
			<Container>
				<BasketStats
					basket={basket}
					composition={composition}
					rates={rates}
					info={info}
					pairPrice={pairPrice}
				/>
				<BasketButtons basket={basket} />
				<Composition composition={composition} />
			</Container>
		</Page>
	)
}

export default Basket
