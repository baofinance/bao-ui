import Badge from '@/components/Badge'
import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useComposition from '@/hooks/baskets/useComposition'
import useBasketRates from '@/hooks/baskets/useNestRate'
import { getDisplayBalance } from '@/utils/numberFormat'
import Link from 'next/link'
import React from 'react'
import { isDesktop } from 'react-device-detect'
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
			<button className='w-full rounded-lg border border-primary-300 bg-primary-100 p-4 py-2 hover:bg-primary-200'>
				<div className='flex w-full flex-row'>
					<div className='flex w-full'>
						<div className='my-auto'>
							<img src={`/images/tokens/${basket.symbol}.png`} className={`inline-block ${isDesktop ? 'h-8 w-8' : 'h-6 w-6'}`} />
							<span className='inline-block text-left align-middle'>
								<Typography className='ml-2 font-semibold'>{basket.symbol}</Typography>
								<Typography variant='sm' className={`ml-2 text-text-200 ${!isDesktop && 'hidden'}`}>
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
											className={`-ml-2 inline-block select-none duration-200 first:ml-0 ${isDesktop ? 'h-8 w-8' : 'h-6 w-6'}`}
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
									<Typography variant='sm' className='m-0 font-medium leading-5'>
										${getDisplayBalance(rates.usd)}
									</Typography>
									<Badge className='bg-green text-xs'>0% Fee</Badge>
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
