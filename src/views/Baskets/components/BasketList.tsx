import React from 'react'
import useComposition from '../../../hooks/baskets/useComposition'
import useBasketRates from '../../../hooks/baskets/useNestRate'
import { Col, Row } from 'react-bootstrap'
import { ListHeader, ListItem, ListItemHeader } from '../../../components/List'
import { IconContainer, StyledIcon } from 'components/Icon'
import { SpinnerLoader } from '../../../components/Loader'
import { ActiveSupportedBasket } from '../../../bao/lib/types'
import Tooltipped from '../../../components/Tooltipped'
import { getDisplayBalance } from '../../../utils/numberFormat'

const BasketList: React.FC<BasketListProps> = ({ baskets }) => {
	return (
		<>
			<ListHeader
				headers={['Basket Name', 'Underlying Assets', 'Cost to Mint']}
			/>
			{baskets && baskets.map((basket) => <BasketListItem basket={basket} />)}
		</>
	)
}

const BasketListItem: React.FC<BasketListItemProps> = ({ basket }) => {
	const composition = useComposition(basket)
	const rates = useBasketRates(basket)

	return (
		<ListItem>
			<ListItemHeader>
				<Row lg={3} style={{ width: '100%' }}>
					<Col>
						<IconContainer>
							<StyledIcon src={basket.icon} alt={basket.symbol} />
						</IconContainer>
						{basket.symbol}
					</Col>
					<Col>
						{composition ? (
							composition.map((component: any) => {
								return (
									<Tooltipped content={component.symbol} key={component.symbol}>
										<StyledIcon src={component.image} />
									</Tooltipped>
								)
							})
						) : (
							<SpinnerLoader />
						)}
					</Col>
					<Col>${rates && getDisplayBalance(rates.usd)}</Col>
				</Row>
			</ListItemHeader>
		</ListItem>
	)
}

type BasketListProps = {
	baskets: ActiveSupportedBasket[]
}

type BasketListItemProps = {
	basket: ActiveSupportedBasket
}

export default BasketList
