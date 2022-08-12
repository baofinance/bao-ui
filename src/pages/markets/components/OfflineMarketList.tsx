import { ActiveSupportedMarket } from 'bao/lib/types'
import BigNumber from 'bignumber.js'
import HrText from 'components/HrText'
import { SpinnerLoader } from 'components/Loader'
import useBao from 'hooks/base/useBao'
import { AccountLiquidity } from 'hooks/markets/useAccountLiquidity'
import { Balance } from 'hooks/markets/useBalances'
import React, { useMemo } from 'react'
import { Accordion, Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { getDisplayBalance } from 'utils/numberFormat'

export const OfflineMarketList: React.FC<MarketListProps> = ({ markets: _markets }: MarketListProps) => {
	const bao = useBao()

	const collateralMarkets = useMemo(() => {
		if (!(bao && _markets)) return
		return _markets.filter(market => !market.isSynth)
	}, [bao, _markets])

	const synthMarkets = useMemo(() => {
		if (!(bao && _markets)) return
		return _markets.filter(market => market.isSynth)
	}, [bao, _markets])

	return (
		<>
			{collateralMarkets && synthMarkets ? (
				<Row>
					<Col lg={12} xl={6}>
						<HrText content='Collateral' />
						<>
							<MarketListHeader headers={['Asset', 'Liquidity']} />
						</>
						{collateralMarkets.map((market: ActiveSupportedMarket) => (
							<OfflineListItemCollateral market={market} key={market.marketAddress} />
						))}
					</Col>
					<Col lg={12} xl={6}>
						<HrText content='Synthetics' />
						<MarketListHeader headers={['Asset', 'APR', 'Liquidity']} />
						{synthMarkets.map((market: ActiveSupportedMarket) => (
							<OfflineListItemSynth market={market} key={market.marketAddress} />
						))}
					</Col>
				</Row>
			) : (
				<SpinnerLoader block />
			)}
		</>
	)
}

const MarketListHeader: React.FC<MarketListHeaderProps> = ({ headers }: MarketListHeaderProps) => {
	return (
		<Container fluid>
			<Row style={{ padding: '0.5rem 12px' }}>
				{headers.map((header: string) => (
					<MarketListHeaderCol style={{ paddingBottom: '0px' }} key={header}>
						<b>{header}</b>
					</MarketListHeaderCol>
				))}
			</Row>
		</Container>
	)
}

const OfflineListItemCollateral: React.FC<MarketListItemProps> = ({ market }: MarketListItemProps) => {
	return (
		<>
			<OfflineAccordionItem style={{ padding: '12px' }}>
				<OfflineAccordionHeader>
					<Row style={{ width: '100%' }}>
						<Col>
							<img src={require(`assets/img/tokens/${market.underlyingSymbol}.png`).default} alt={market.symbol} />
							{window.screen.width > 1200 && <b>{market.underlyingSymbol}</b>}
						</Col>
						<Col>{`$${getDisplayBalance(market.supplied * market.price - market.totalBorrows * market.price, 0, 0)}`}</Col>
					</Row>
				</OfflineAccordionHeader>
			</OfflineAccordionItem>
		</>
	)
}

const OfflineListItemSynth: React.FC<MarketListItemProps> = ({ market }: MarketListItemProps) => {
	return (
		<>
			<OfflineAccordionItem style={{ padding: '12px' }}>
				<OfflineAccordionHeader>
					<Row style={{ width: '100%' }}>
						<Col>
							<img src={require(`assets/img/tokens/${market.underlyingSymbol}.png`).default} alt={market.symbol} />
							{window.screen.width > 1200 && <b>{market.underlyingSymbol}</b>}
						</Col>
						<Col>{market.borrowApy.toFixed(2)}%</Col>
						<Col>{`$${getDisplayBalance(market.supplied * market.price - market.totalBorrows * market.price, 0, 0)}`}</Col>
					</Row>
				</OfflineAccordionHeader>
			</OfflineAccordionItem>
		</>
	)
}

export default OfflineMarketList

type MarketListProps = {
	markets: ActiveSupportedMarket[]
}

type MarketListHeaderProps = {
	headers: string[]
}

type MarketListItemProps = {
	market: ActiveSupportedMarket
	accountBalances?: Balance[]
	accountMarkets?: ActiveSupportedMarket[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
}

const StyledAccordionHeader = styled(Accordion.Header)`
	&:active {
		border-radius: 8px 8px 0px 0px;
	}

	img {
		height: 32px;
		margin-right: 0.75rem;
		vertical-align: middle;
	}

	> button {
		background-color: ${props => props.theme.color.primary[100]};
		color: ${props => props.theme.color.text[100]};
		padding: 1.25rem;
		border: ${props => props.theme.border.default};
		border-radius: 8px;

		&:hover,
		&:focus,
		&:active,
		&:not(.collapsed) {
			background-color: ${props => props.theme.color.primary[200]};
			color: ${props => props.theme.color.text[100]};
			border: ${props => props.theme.border.default};
			box-shadow: none;
			border-radius: 8px 8px 0px 0px;
		}

		&:not(.collapsed) {
			transition: none;

			::after {
				background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${props =>
					props.theme.color.text[100].replace(
						'#',
						'%23',
					)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
			}
		}

		::after {
			// don't turn arrow blue
			background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${props =>
				props.theme.color.text[100].replace(
					'#',
					'%23',
				)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
		}

		.row > .col {
			margin: auto 0;
			text-align: right;

			&:first-child {
				text-align: left;
			}

			&:last-child {
				margin-right: 25px;
			}
		}
	}
`

const MarketListHeaderCol = styled(Col)`
	text-align: right;

	&:first-child {
		text-align: left;
	}

	&:last-child {
		margin-right: 46px;
	}
`

const OfflineAccordionItem = styled.div`
	background-color: transparent;
	border-color: transparent;
	width: 100%;
`

const OfflineAccordionHeader = styled.div`
		background: ${props => props.theme.color.primary[100]};
		color: ${props => props.theme.color.text[100]};
		padding: 1.25rem;
		border: ${props => props.theme.border.default};
		border-radius: 8px;

		&:hover,
		&:focus,
		&:active {
			background: ${props => props.theme.color.primary[200]};
			color: ${props => props.theme.color.text[100]};
			box-shadow: none;
		}
		
		.row > .col {
			margin: auto 0;
			text-align: right;

			&:first-child {
				text-align: left;
			}

			&:last-child {
			}
		}
			
		img {
			height: 32px;
			margin-right: 0.75rem;
			vertical-align: middle;
		}
	}
`
