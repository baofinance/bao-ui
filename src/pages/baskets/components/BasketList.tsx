import { FeeBadge } from '@/components/Badge'
import { IconContainer, StyledIcon } from '@/components/Icon'
import Loader from '@/components/Loader'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { ActiveSupportedBasket } from '../../../bao/lib/types'
import { ListHeader, ListItem, ListItemHeader } from '@/components/List'
import Tooltipped from '@/components/Tooltipped'
import useComposition from '@/hooks/baskets/useComposition'
import useBasketRates from '@/hooks/baskets/useNestRate'
import { getDisplayBalance } from '@/utils/numberFormat'
import Link from 'next/link'
import Typography from '@/components/Typography'
import Image from 'next/image'

const BasketList: React.FC<BasketListProps> = ({ baskets }) => {
	return (
		<>
			<ListHeader headers={['Basket Name', 'Underlying Assets', 'Cost to Mint']} />
			{baskets && baskets.map(basket => <BasketListItem basket={basket} key={basket.nid} />)}
		</>
	)
}

const BasketListItem: React.FC<BasketListItemProps> = ({ basket }) => {
	const composition = useComposition(basket)
	const rates = useBasketRates(basket)

	return (
		<Link href={`/baskets/${basket.symbol}`}>
			<button className='w-full rounded-lg border border-primary-300 bg-primary-100 p-4 py-2 text-text-100 hover:bg-primary-200'>
				<div className='flex w-full flex-row'>
					<div className='mx-auto my-0 flex w-full flex-col items-start align-middle'>
						<div className='mx-0 my-auto inline-block text-text-100'>
							<img className='z-10 inline-block h-8 w-8 select-none duration-200' src={`/images/tokens/${basket.symbol}.png`} />
							<span className='inline-block align-middle text-left'>
								<Typography className='ml-2 leading-5 font-semibold'>{basket.symbol}</Typography>
								<Typography variant='sm' className='ml-2 text-text-200 leading-4'>
									{basket.desc}
								</Typography>
							</span>
						</div>
					</div>
					<div className='mx-auto my-0 flex w-full items-center justify-center'>
						{composition ? (
							composition.map((component: any) => {
								return (
									<Tooltipped content={component.symbol} key={component.symbol} placement='bottom'>
										<img
											className='-ml-2 inline-block h-8 w-8 select-none duration-200 first:ml-0'
											src={component.image}
											alt={component.symbol}
										/>
									</Tooltipped>
								)
							})
						) : (
							<Loader />
						)}
					</div>
					<div className='mx-auto my-0 flex w-full flex-col items-end'>
						<span className='inline-block align-middle'>
							{rates ? (
								<>
									<p className='m-0 leading-5'>${getDisplayBalance(rates.usd)}</p>
									<FeeBadge>0% Fee</FeeBadge>
								</>
							) : (
								<Loader />
							)}
						</span>
					</div>
				</div>
			</button>
		</Link>
	)
}

type BasketListProps = {
	baskets: ActiveSupportedBasket[]
}

type BasketListItemProps = {
	basket: ActiveSupportedBasket
}

export default BasketList