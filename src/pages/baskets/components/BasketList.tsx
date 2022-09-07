import Image from 'next/future/image'
import Link from 'next/link'
import React from 'react'
import { isDesktop } from 'react-device-detect'

import Badge from '@/components/Badge'
import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useComposition from '@/hooks/baskets/useComposition'
import useBasketRates from '@/hooks/baskets/useBasketRate'
import { getDisplayBalance } from '@/utils/numberFormat'

import { ActiveSupportedBasket } from '../../../bao/lib/types'

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
		<Link href={`/baskets/${basket.symbol}`} key={basket.nid}>
			<button className='w-full rounded border border-primary-300 bg-primary-100 p-4 py-2 hover:bg-primary-200'>
				<div className='flex w-full flex-row'>
					<div className='flex w-full'>
						<div className='my-auto'>
							<Image src={`/images/tokens/${basket.symbol}.png`} alt={basket.symbol} className={`inline-block`} height={32} width={32} />
							<span className='inline-block text-left align-middle'>
								<Typography className='ml-2 font-bold'>{basket.symbol}</Typography>
								{isDesktop && (
									<Typography variant='sm' className={`ml-2 font-light text-text-200`}>
										{basket.desc}
									</Typography>
								)}
							</span>
						</div>
					</div>
					<div className='mx-auto my-0 flex w-full items-center justify-center'>
						{composition ? (
							composition.map((component: any) => {
								return (
									<Tooltipped content={component.symbol} key={component.symbol} placement='bottom'>
										<span className={`-ml-2 inline-block select-none duration-200 first:ml-0`}>
											<Image src={component.image} alt={component.symbol} height={32} width={32} />
										</span>
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
									<Typography variant='sm' className='m-0 font-semibold leading-5'>
										${getDisplayBalance(rates.usd)}
									</Typography>
									<Badge className='bg-green text-xs font-medium'>0% Fee</Badge>
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
