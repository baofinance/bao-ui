import { FeeBadge } from 'components/Badge'
import { IconContainer, StyledIcon } from 'components/Icon'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ActiveSupportedBasket } from '../../../bao/lib/types'
import { ListHeader, ListItem, ListItemHeader } from '../../../components/List'
import { SpinnerLoader } from '../../../components/Loader'
import Tooltipped from '../../../components/Tooltipped'
import useComposition from '../../../hooks/baskets/useComposition'
import useBasketRates from '../../../hooks/baskets/useNestRate'
import { getDisplayBalance } from '../../../utils/numberFormat'

const BasketList: React.FC<BasketListProps> = ({ baskets }) => {
	return (
		<>
			<ListHeader
				headers={['Basket Name', 'Underlying Assets', 'Cost to Mint']}
			/>
			{baskets &&
				baskets.map((basket) => (
					<BasketListItem basket={basket} key={basket.nid} />
				))}
		</>
	)
}

const BasketListItem: React.FC<BasketListItemProps> = ({ basket }) => {
	const composition = useComposition(basket)
	const rates = useBasketRates(basket)

	const navigate = useNavigate()
	const handleClick = () => navigate(`/baskets/${basket.nid}`)

	return (
		<ListItem onClick={handleClick}>
			<ListItemHeader>
				<Row lg={3} style={{ width: '100%' }}>
					<Col>
						<IconContainer>
							<StyledIcon src={basket.icon} alt={basket.symbol} />
							<span
								style={{ display: 'inline-block', verticalAlign: 'middle' }}
							>
								<p style={{ margin: '0', lineHeight: '1.2rem' }}>
									{basket.symbol}
								</p>
								<SubText>{basket.desc}</SubText>
							</span>
						</IconContainer>
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
					<Col>
						<span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
							<p style={{ margin: '0', lineHeight: '1.2rem' }}>
								${rates ? getDisplayBalance(rates.usd) : <SpinnerLoader />}
							</p>
							<FeeBadge>0% Fee</FeeBadge>
						</span>
					</Col>
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

const SubText = styled.p`
	color: ${(props) => props.theme.color.text[200]};
	font-size: 0.875rem;
	margin: 0;
	line-height: 1rem;
`
