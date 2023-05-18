import Badge from '@/components/Badge'
import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBasketRates from '@/hooks/baskets/useBasketRate'
import useComposition from '@/hooks/baskets/useComposition'
import { getDisplayBalance } from '@/utils/numberFormat'
import Image from 'next/future/image'
import Link from 'next/link'
import React from 'react'
import { isDesktop } from 'react-device-detect'

import { ActiveSupportedBasket } from '../../../bao/lib/types'

const BasketList: React.FC<BasketListProps> = ({ baskets }) => {
	return (
		<>
			<ListHeader headers={['Basket Name', 'Underlying Assets', 'Cost to Mint']} />
			<div className='flex flex-col gap-4'>{baskets && baskets.map(basket => <BasketListItem basket={basket} key={basket.nid} />)}</div>
		</>
	)
}

const BasketListItem: React.FC<BasketListItemProps> = ({ basket }) => {
	const composition = useComposition(basket)
	const rates = useBasketRates(basket)

	return (
		<Link href={`/baskets/${basket.symbol}`} key={basket.nid}>
			<button className='glassmorphic-card w-full px-4 py-2 duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'>
				<div className='flex w-full flex-row'>
					<div className='flex w-full'>
						<div className='my-auto'>
							<Image src={`/images/tokens/${basket.symbol}.png`} alt={basket.symbol} className={`inline-block`} height={32} width={32} />
							<span className='inline-block text-left align-middle'>
								<Typography variant='lg' className='ml-2 font-bakbak'>
									{basket.symbol}
								</Typography>
								{isDesktop && (
									<Typography variant='sm' className={`ml-2 text-baoWhite`}>
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
											<Image src={`/images/tokens/${component.symbol}.png`} alt={component.symbol} height={32} width={32} />
										</span>
									</Tooltipped>
								)
							})
						) : (
							<Loader />
						)}
					</div>

					<div className='mx-auto my-0 flex w-full flex-col items-end justify-center text-right'>
						<span className='inline-block'>
							{rates ? (
								<>
									<Typography className='m-0 font-bakbak leading-5'>${getDisplayBalance(rates.usd)}</Typography>
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
