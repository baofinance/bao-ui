import { BigNumber } from 'bignumber.js'
import { Button } from 'components/Button'
import { SpinnerLoader } from 'components/Loader'
import Tooltipped from 'components/Tooltipped'
import { Basket } from 'contexts/Baskets'
import useComposition from 'hooks/useComposition'
import useGraphPriceHistory from 'hooks/useGraphPriceHistory'
import useBasketRate from 'hooks/useBasketRate'
import React, { useMemo } from 'react'
import 'react-tabs/style/react-tabs.css'
import { getDisplayBalance } from 'utils/numberFormat'
import {
	AssetImage,
	AssetImageContainer,
	ColumnText,
	ListCol,
	ListItemContainer,
	MobileListChange,
	MobileListDesc,
	MobileListItemContainer,
	MobileListItemWrapper,
	MobileListPrice,
	MobileListText,
	MobileListTitle,
	MobileBasketLink,
	BasketImage,
} from './styles'

const BasketListItem: React.FC<BasketListItemProps> = ({ basket }) => {
	const { basketTokenAddress } = basket
	const { usdPerIndex } = useBasketRate(basketTokenAddress)

	const indexActive = true // startTime * 1000 - Date.now() <= 0

	const priceHistory = useGraphPriceHistory(basket)
	const basketPriceChange24h = useMemo(() => {
		return (
			priceHistory &&
			new BigNumber(priceHistory[priceHistory.length - 1].close)
				.minus(priceHistory[priceHistory.length - 2].close)
				.div(priceHistory[priceHistory.length - 1].close)
				.times(100)
		)
	}, [priceHistory])

	const composition = useComposition(basket)

	return (
		<>
			<ListItemContainer>
				<ListCol width={'17.5%'} align={'left'}>
					<ColumnText>
						<BasketImage src={basket.icon} alt={basket.basketToken} />
						<b>{basket.basketToken}</b>
					</ColumnText>
				</ListCol>
				<ListCol width={'37.5%'} align={'center'}>
					<AssetImageContainer>
						{composition ? (
							composition.map((component: any) => {
								return (
									<Tooltipped content={component.symbol} key={component.symbol}>
										<AssetImage src={component.imageUrl} />
									</Tooltipped>
								)
							})
						) : (
							<SpinnerLoader />
						)}
					</AssetImageContainer>
				</ListCol>
				<ListCol width={'15%'} align={'center'}>
					<ColumnText>
						<b>
							$
							{usdPerIndex ? (
								getDisplayBalance(usdPerIndex, 0)
							) : (
								<SpinnerLoader />
							)}{' '}
						</b>
					</ColumnText>
				</ListCol>
				<ListCol width={'15%'} align={'center'}>
					<ColumnText>
						{basketPriceChange24h ? (
							<>
								<b>
									<span
										style={{
											color: basketPriceChange24h.isNaN()
												? 'white'
												: basketPriceChange24h.gt(0)
												? 'green'
												: 'red',
										}}
									>
										{priceHistory &&
											(basketPriceChange24h.isNaN()
												? '~'
												: `${getDisplayBalance(basketPriceChange24h, 0)}%`)}
									</span>
								</b>
							</>
						) : (
							<SpinnerLoader />
						)}
					</ColumnText>
				</ListCol>
				<ListCol width={'15%'} align={'right'}>
					<div style={{ height: '50px' }}>
						<Button
							size="md"
							width="90%"
							disabled={!indexActive}
							text={indexActive ? 'Select' : undefined}
							to={`/baskets/${basket.nid}`}
						/>
					</div>
				</ListCol>
			</ListItemContainer>

			{/* Mobile List */}

			<MobileBasketLink exact activeClassName="active" to={`/baskets/${basket.nid}`}>
				<MobileListItemWrapper>
					<MobileListItemContainer>
						<BasketImage src={basket.icon} alt={basket.basketToken} />
						<MobileListText>
							<MobileListTitle>{basket.basketToken}</MobileListTitle>
							<MobileListDesc>
								Complete exposure to key DeFi sectors.
							</MobileListDesc>
						</MobileListText>
						<MobileListPrice>
							{' '}
							<span>
								$
								{usdPerIndex ? (
									getDisplayBalance(usdPerIndex, 0)
								) : (
									<SpinnerLoader />
								)}
							</span>
							<MobileListChange>
								<MobileListDesc>~</MobileListDesc>
							</MobileListChange>
						</MobileListPrice>
					</MobileListItemContainer>
				</MobileListItemWrapper>
			</MobileBasketLink>
		</>
	)
}

interface BasketListItemProps {
	basket: Basket
}

export default BasketListItem
