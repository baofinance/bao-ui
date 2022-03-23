import Config from 'bao/lib/config'
import { ActiveSupportedMarket } from 'bao/lib/types'
import { getComptrollerContract } from 'bao/utils'
import BigNumber from 'bignumber.js'
import { Button } from 'components/Button'
import { SubmitButton } from 'components/Button/Button'
import HrText from 'components/HrText'
import { SpinnerLoader } from 'components/Loader'
import Tooltipped from 'components/Tooltipped'
import useBao from 'hooks/base/useBao'
import useTransactionHandler from 'hooks/base/useTransactionHandler'
import {
	AccountLiquidity,
	useAccountLiquidity,
} from 'hooks/markets/useAccountLiquidity'
import {
	Balance,
	useAccountBalances,
	useBorrowBalances,
	useSupplyBalances,
} from 'hooks/markets/useBalances'
import { useExchangeRates } from 'hooks/markets/useExchangeRates'
import { useAccountMarkets } from 'hooks/markets/useMarkets'
import React, { useMemo, useState } from 'react'
import {
	Accordion,
	Badge,
	Col,
	Container,
	FormCheck,
	Row,
} from 'react-bootstrap'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { decimate, getDisplayBalance } from 'utils/numberFormat'
import { MarketBorrowModal, MarketSupplyModal } from './Modals'
import { MarketDetails, StatBlock } from './Stats'

export const NetworkMarketList: React.FC<MarketListProps> = ({
	markets: _markets,
}: MarketListProps) => {

	const collateralMarkets = useMemo(() => {
		if (!(_markets)) return
		return _markets
			.filter((market) => !market.isSynth)
	}, [_markets, ])

	const synthMarkets = useMemo(() => {
		if (!(_markets)) return
		return _markets
			.filter((market) => market.isSynth)
	}, [_markets])

	return (
		<>
			{collateralMarkets &&
			synthMarkets ? (
				<Row>
					<Col lg={12} xl={6}>
						<HrText content="Collateral" />
						<MarketListHeader headers={['Asset', 'Liquidity']} />
						{collateralMarkets.map((market: ActiveSupportedMarket) => (
							<MarketListItemCollateral
								market={market}
								key={market.marketAddress}
							/>
						))}
					</Col>
					<Col lg={12} xl={6}>
						<HrText content="Synthetics" />
						<MarketListHeader headers={['Asset', 'APR', 'Liquidity']} />
						{synthMarkets.map((market: ActiveSupportedMarket) => (
							<MarketListItemSynth
								market={market}
								key={market.marketAddress}
							/>
						))}
					</Col>
				</Row>
			) : (
				<SpinnerLoader block />
			)}
		</>
	)
}

const MarketListHeader: React.FC<MarketListHeaderProps> = ({
	headers,
}: MarketListHeaderProps) => {
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

const MarketListItemCollateral: React.FC<MarketListItemProps> = ({
	market,
}: MarketListItemProps) => {

	return (
		<Accordion>
			<StyledAccordionItem eventKey="0" style={{ padding: '12px' }}>
				<StyledAccordionHeader>
					<Row style={{ width: '100%' }}>
						<Col>
							<img src={market.icon} /> <b>{market.underlyingSymbol}</b>
						</Col>
						<Col>
							{`$${getDisplayBalance(
								market.supplied * market.price -
									market.totalBorrows * market.price,
								0,
								0,
							)}`}
						</Col>
					</Row>
				</StyledAccordionHeader>
			</StyledAccordionItem>
		</Accordion>
	)
}

const MarketListItemSynth: React.FC<MarketListItemProps> = ({
	market,
}: MarketListItemProps) => {

	return (
		<Accordion>
			<StyledAccordionItem eventKey="0" style={{ padding: '12px' }}>
				<StyledAccordionHeader>
					<Row style={{ width: '100%' }}>
						<Col>
							<img src={market.icon} /> <b>{market.underlyingSymbol}</b>
						</Col>
						<Col>{market.borrowApy.toFixed(2)}%</Col>
						<Col>
						{`$${getDisplayBalance(
								market.supplied * market.price -
									market.totalBorrows * market.price,
								0,
								0,
							)}`}
						</Col>
					</Row>
				</StyledAccordionHeader>
			</StyledAccordionItem>
		</Accordion>
	)
}

type MarketListProps = {
	markets: ActiveSupportedMarket[]
}

type MarketListHeaderProps = {
	headers: string[]
}

type MarketListItemProps = {
	market: ActiveSupportedMarket
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
		background-color: ${(props) => props.theme.color.primary[100]};
		color: ${(props) => props.theme.color.text[100]};
		padding: 1.25rem;
		border: ${(props) => props.theme.border.default};
		border-radius: 8px;

		&:hover,
		&:focus,
		&:active,
		&:not(.collapsed) {
			background-color: ${(props) => props.theme.color.primary[200]};
			color: ${(props) => props.theme.color.text[100]};
			border: ${(props) => props.theme.border.default};
			box-shadow: none;
			border-radius: 8px 8px 0px 0px;
		}

		&:not(.collapsed) {
			transition: none;

			&:focus,
			&:active {
				border-color: ${(props) => props.theme.color.primary[300]};
			}

			::after {
				background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${(
					props,
				) =>
					props.theme.color.text[100].replace(
						'#',
						'%23',
					)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
			}
		}

		::after {
			// don't turn arrow blue
			background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${(
				props,
			) =>
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

const StyledAccordionItem = styled(Accordion.Item)`
	background-color: transparent;
	border-color: transparent;
`

const StyledAccordionBody = styled(Accordion.Body)`
	background-color: ${(props) => props.theme.color.primary[100]};
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
	border: ${(props) => props.theme.border.default};
	border-top: none;
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
