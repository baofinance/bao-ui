import { ParentSize } from '@visx/responsive'
import Config from 'bao/lib/config'
import BigNumber from 'bignumber.js'
import AreaGraph from 'components/Graphs/AreaGraph/AreaGraph'
import { SpinnerLoader } from 'components/Loader'
import Spacer from 'components/Spacer'
import _ from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import GraphClient from 'utils/graph'
import { getDisplayBalance } from 'utils/numberFormat'
import {
	BasketBoxHeader,
	PrefButtons,
	PriceGraphContainer,
	StyledGraphContainer,
} from './styles'

const PriceGraphs: React.FC = () => {
	const [priceData, setPriceData] = useState<any | undefined>()
	const [activeBasket, setActiveBasket] = useState<any | undefined>()

	const activeToken = useMemo(() => {
		return _.find(
			priceData,
			(d: any) => d.id === Config.addressMap.WETH, // activeBasket.basketAddress[137]
		)
	}, [activeBasket])

	const basketPriceChange24h = useMemo(() => {
		if (!(activeBasket && activeToken.dayData)) return

		const { dayData } = activeToken
		return new BigNumber(dayData[dayData.length - 1].close)
			.minus(dayData[dayData.length - 2].close)
			.div(dayData[dayData.length - 1].close)
			.times(100)
	}, [activeBasket])

	useEffect(() => {
		GraphClient.getPriceHistoryMultiple(
			Config.baskets.map(() => Config.addressMap.WETH), // basket.basketAddress[137]
		).then((res: any) => {
			// Clean price data from subgraph
			const tokens = _.cloneDeep(res.tokens).map((token: any) => {
				token.dayData = _cleanPriceData(token.dayData)
				return token
			})
			setPriceData(tokens)
			setActiveBasket(Config.baskets[0])
		})
	}, [])

	const _cleanPriceData = (dayData: any) =>
		_.reverse(
			dayData.map((data: any) => ({
				date: new Date(data.date * 1000).toISOString(),
				close: parseFloat(data.priceUSD),
			})),
		)

	return (
		<PriceGraphContainer>
			<PrefButtons style={{ width: '100%' }}>
				<BasketBoxHeader style={{ float: 'left' }}>Basket Price</BasketBoxHeader>
				{Config.baskets.map((basket) => (
					<Button
						variant="outline-primary"
						onClick={() => setActiveBasket(basket)}
						active={activeBasket === basket}
						key={basket.symbol}
						style={{
							margin:
								'${(props) => props.theme.spacing[1]}px ${(props) => props.theme.spacing[2]}px',
						}}
					>
						{basket.symbol}
					</Button>
				))}
				<BasketBoxHeader style={{ float: 'right' }}>
					{basketPriceChange24h ? (
						<>
							$
							{activeToken.dayData &&
								getDisplayBalance(
									new BigNumber(
										activeToken.dayData[activeToken.dayData.length - 1].close,
									),
									0,
								)}
							<span
								className="smalltext"
								style={{
									color: basketPriceChange24h.gt(0)
										? '${(props) => props.theme.color.green}'
										: '${(props) => props.theme.color.red}',
								}}
							>
								{activeToken.dayData &&
									getDisplayBalance(basketPriceChange24h, 0)}
								{'%'}
							</span>
						</>
					) : (
						<SpinnerLoader />
					)}
				</BasketBoxHeader>
			</PrefButtons>
			<Spacer />
			{activeBasket && (
				<StyledGraphContainer>
					<ParentSize>
						{(parent) => (
							<AreaGraph
								width={parent.width}
								height={parent.height}
								timeseries={activeToken.dayData}
								timeframe="Y"
							/>
						)}
					</ParentSize>
				</StyledGraphContainer>
			)}
		</PriceGraphContainer>
	)
}

export default PriceGraphs
