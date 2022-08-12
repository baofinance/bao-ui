import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faAngleDoubleRight, faFileContract } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StyledBadge } from 'components/Badge'
import { CornerButton, CornerButtons } from 'components/Button/Button'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import Tooltipped from 'components/Tooltipped'
import React, { useMemo } from 'react'
import { Container } from 'react-bootstrap'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { SpinnerLoader } from '../../components/Loader'
import useBasketInfo from '../../hooks/baskets/useBasketInfo'
import useBaskets from '../../hooks/baskets/useBaskets'
import useComposition from '../../hooks/baskets/useComposition'
import useBasketRates from '../../hooks/baskets/useNestRate'
import usePairPrice from '../../hooks/baskets/usePairPrice'
import { getDisplayBalance } from '../../utils/numberFormat'
import BasketButtons from './components/BasketButtons'
import BasketStats from './components/BasketStats'
import Composition from './components/Composition'
import Description from './components/Description'

const Basket: React.FC = () => {
	const { basketId } = useParams()
	const baskets = useBaskets()

	const basket = useMemo(() => baskets && baskets.find(basket => basket.symbol === basketId), [baskets])
	const composition = useComposition(basket)
	const rates = useBasketRates(basket)
	const info = useBasketInfo(basket)
	const pairPrice = usePairPrice(basket)

	return basket ? (
		<Page>
			<Helmet>
				<title>Bao | {basketId} Basket</title>
				<meta name='description' content={`Mint and redeem ${basketId}.`} />
			</Helmet>
			<Container>
				<CornerButtons>
					<Tooltipped content='View Contract on Etherscan'>
						<CornerButton href={`https://etherscan.io/address/${basket.basketAddresses[1]}`} target='_blank'>
							<FontAwesomeIcon icon={faFileContract} />
						</CornerButton>
					</Tooltipped>
				</CornerButtons>
				<StyledPageHeader>
					<PageHeader
						icon={require(`assets/img/tokens/${basket.symbol}.png`).default}
						title={basket.symbol}
						subtitle='Mint synthethic assets with multiple types of collateral!'
					/>
					<br />
					<StyledBadge>
						1 {basket.symbol} ={' '}
						{rates ? (
							<>
								<FontAwesomeIcon icon={faEthereum} /> {getDisplayBalance(rates.eth)} <FontAwesomeIcon icon={faAngleDoubleRight} />{' '}
								{getDisplayBalance(rates.dai)}
								{' DAI '}
								<FontAwesomeIcon icon={faAngleDoubleRight} /> {`$${getDisplayBalance(rates.usd)}`}
							</>
						) : (
							<SpinnerLoader />
						)}
					</StyledBadge>
				</StyledPageHeader>
			</Container>
			<Container>
				<BasketStats basket={basket} composition={composition} rates={rates} info={info} pairPrice={pairPrice} />
				<BasketButtons basket={basket} swapLink={basket.swap} />
				<Composition composition={composition} />
				<Description basketAddress={basket.basketAddresses[1]} />
			</Container>
		</Page>
	) : (
		<SpinnerLoader />
	)
}

export default Basket

const StyledPageHeader = styled.div`
	align-items: center;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	margin: ${props => props.theme.spacing[6]}px auto 0;
`
