import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faAngleDoubleRight, faFileContract } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useMemo } from 'react'

import Badge from '@/components/Badge'
import PageHeader from '@/components/PageHeader'
import Tooltipped from '@/components/Tooltipped'
import useBasketInfo from '@/hooks/baskets/useBasketInfo'
import useBaskets from '@/hooks/baskets/useBaskets'
import useComposition from '@/hooks/baskets/useComposition'
import useBasketRates from '@/hooks/baskets/useNestRate'
import usePairPrice from '@/hooks/baskets/usePairPrice'
import { getDisplayBalance } from '@/utils/numberFormat'

import Loader from '../../components/Loader'
import BasketButtons from './components/BasketButtons'
import BasketStats from './components/BasketStats'
import Composition from './components/Composition'
import Description from './components/Description'

const Basket: React.FC = () => {
	const router = useRouter()
	const basketId = router.query.basket
	const baskets = useBaskets()

	const basket = useMemo(() => baskets && baskets.find(basket => basket.symbol === basketId), [baskets])
	const composition = useComposition(basket)
	const rates = useBasketRates(basket)
	const info = useBasketInfo(basket)
	const pairPrice = usePairPrice(basket)

	return basket ? (
		<>
			<NextSeo title={`${basketId} Basket`} description={`Mint or Redeem ${basketId}`} />
			<div className='top-4 right-4 float-right mt-4 text-2xl hover:cursor-pointer'>
				<Tooltipped content='View Contract on Etherscan' placement='bottom'>
					<a
						className='float-right mt-2 mr-3 align-middle text-xl hover:cursor-pointer'
						href={`https://etherscan.io/address/${basket.basketAddresses[1]}`}
						target='_blank'
						rel='noreferrer'
					>
						<FontAwesomeIcon icon={faFileContract} />
					</a>
				</Tooltipped>
			</div>
			<div className='mx-auto mt-6 mb-0 box-border flex flex-col items-center ml-7'>
				<PageHeader icon={`/images/tokens/${basket.icon}`} title={basket.symbol} />
				<Badge>
					1 {basket.symbol} ={' '}
					{rates ? (
						<>
							<FontAwesomeIcon icon={faEthereum}/> {getDisplayBalance(rates.eth)} <FontAwesomeIcon icon={faAngleDoubleRight} />{' '}
							{getDisplayBalance(rates.dai)}
							{' DAI '}
							<FontAwesomeIcon icon={faAngleDoubleRight} /> {`$${getDisplayBalance(rates.usd)}`}
						</>
					) : (
						<Loader />
					)}
				</Badge>
			</div>
			<BasketStats basket={basket} composition={composition} rates={rates} info={info} pairPrice={pairPrice} />
			<BasketButtons basket={basket} swapLink={basket.swap} />
			<Composition composition={composition} />
			<Description basketAddress={basket.basketAddresses[1]} />
		</>
	) : (
		<Loader />
	)
}

export default Basket
