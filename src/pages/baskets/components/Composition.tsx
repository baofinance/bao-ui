import Badge from '@/components/Badge'
import Button from '@/components/Button/Button'
import DonutGraph from '@/components/Graphs/PieGraph'
import Loader from '@/components/Loader'
import { Progress } from '@/components/ProgressBar'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import { BasketComponent } from '@/hooks/baskets/useComposition'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faChartPie, faTable } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BN from 'bignumber.js' // INFO: this is necessary for decimal display logic
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useState } from 'react'
import { isDesktop } from 'react-device-detect'

type CompositionProps = {
	composition: BasketComponent[]
	rates: any
	info: any
	basketId: string
}

type DisplayType = 'TABLE' | 'PIE'

const Composition: React.FC<CompositionProps> = ({ composition, rates, info, basketId }) => {
	const [displayType, setDisplayType] = useState<DisplayType>('TABLE')

	return (
		<>
			<div className='mt-4 mb-2 flex flex-row'>
				<div className='flex flex-row items-center justify-center'>
					<Typography variant='h3' className='float-left mr-2 inline font-semibold'>
						Allocation Breakdown
					</Typography>
					<div className='m-auto flex gap-2'>
						<Button size='xs' onClick={() => setDisplayType('TABLE')} className={`${displayType === 'TABLE' && '!bg-primary-300'} h-8 w-8`}>
							<FontAwesomeIcon icon={faTable} size='xs' />
						</Button>
						<Button size='xs' onClick={() => setDisplayType('PIE')} className={`${displayType === 'PIE' && '!bg-primary-300'} h-8 w-8`}>
							<FontAwesomeIcon icon={faChartPie} size='xs' />
						</Button>
					</div>
				</div>
			</div>
			{displayType === 'TABLE' ? (
				<>
					<div className='rounded border border-primary-300 bg-primary-200'>
						<table className='w-full'>
							<thead>
								<tr className='rounded-t-lg bg-primary-100'>
									<th className='w-[10%] rounded-tl-lg p-2 text-center font-bold'>Token</th>
									<th className='w-[40%] p-2 text-start font-bold'>Allocation</th>
									<th className='w-[20%] p-2 text-center font-bold'>Price</th>
									<th className='w-[10%] p-2 text-center font-bold'>APY</th>
									{isDesktop && <th className='w-[15%] rounded-tr-lg p-2 px-4 text-center font-bold'>Strategy</th>}
								</tr>
							</thead>
							{composition && (
								<tbody className={`${isDesktop ? 'text-base' : 'text-sm'}`}>
									{composition
										.sort((a, b) => (a.percentage.lt(b.percentage) ? 1 : -1))
										.map(component => {
											return (
												<tr key={component.symbol} className='even:bg-primary-100'>
													<td className='p-2 text-center'>
														<Tooltipped content={component.symbol} placement='left'>
															<a>
																<Image
																	src={`/images/tokens/${component.symbol}.png`}
																	width={32}
																	height={32}
																	alt={component.symbol}
																	className='inline'
																/>
															</a>
														</Tooltipped>
													</td>
													<td className='p-2'>
														<Progress
															width={parseFloat(getDisplayBalance(component.percentage))}
															label={`${getDisplayBalance(component.percentage)}%`}
															assetColor={component.color}
														/>
													</td>
													<td className='p-2 text-center'>
														<Badge className='bg-primary-300 font-semibold'>${getDisplayBalance(component.price)}</Badge>
													</td>
													<td className='p-2 text-center'>
														<Tooltipped content={component.apy ? `${new BN(formatUnits(component.apy.mul(100))).toFixed(8)}%` : '-'}>
															<a>
																<Badge className='bg-primary-300 font-semibold'>
																	{component.apy ? `${getDisplayBalance(component.apy.mul(100))}%` : '-'}
																</Badge>
															</a>
														</Tooltipped>
													</td>
													{isDesktop && (
														<td className='p-2 text-center'>
															<Badge className='bg-primary-300 font-semibold'>{component.strategy || 'None'}</Badge>
														</td>
													)}
												</tr>
											)
										}) || (
										<tr>
											{['name', 'perc', 'price', 'apy', 'strategy'].map(tdClass => (
												<td key={Math.random()} className={tdClass}>
													<Loader />
												</td>
											))}
										</tr>
									)}
								</tbody>
							)}
						</table>
						{!composition && (
							<div className='m-auto w-full p-6 text-center align-middle'>
								<Loader />
							</div>
						)}
					</div>
				</>
			) : (
				<div className='rounded border border-primary-300 bg-primary-100'>
					<div className='flex flex-row justify-center'>
						<div className='flex flex-col'>
							<DonutGraph width={250} height={250} composition={composition} basket={basketId} rates={rates} info={info} />
						</div>
						<div className='my-auto flex flex-col items-center gap-2'>
							{composition.map(component => (
								<div className='flex flex-row' key={component.symbol}>
									<Badge color={component.color}>{component.symbol}</Badge>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default Composition
