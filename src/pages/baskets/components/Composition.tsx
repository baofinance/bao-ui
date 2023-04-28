import Badge from '@/components/Badge'
import Button from '@/components/Button/Button'
import DonutGraph from '@/components/Graphs/PieGraph'
import Loader, { PageLoader } from '@/components/Loader'
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
			<div className='mb-2 mt-4 flex flex-row'>
				<div className='flex flex-row items-center justify-center'>
					<Typography variant='h3' className='float-left mr-2 inline font-bakbak'>
						Allocation Breakdown
					</Typography>
				</div>
			</div>
			<>
				<div className='glassmorphic-card min-h-[200px] p-4'>
					{composition ? (
						<div className='grid grid-cols-6'>
							<div className='col-span-1'>
								<div className='flex flex-row justify-center'>
									<div className='flex flex-col'>
										<DonutGraph width={200} height={200} composition={composition} basket={basketId} rates={rates} info={info} />
									</div>
								</div>
							</div>
							<div className='col-span-5'>
								<table className='w-full'>
									<thead>
										<tr className='rounded-t-lg '>
											<th className='w-[10%] rounded-tl-lg p-2 text-center font-bakbak text-lg font-normal text-baoWhite text-opacity-50'>
												Token
											</th>
											<th className='w-[40%] p-2 text-start font-bakbak text-lg font-normal text-baoWhite text-opacity-50'>Allocation</th>
											<th className='w-[20%] p-2 text-center font-bakbak text-lg font-normal text-baoWhite text-opacity-50'>Price</th>
											<th className='w-[10%] p-2 text-center font-bakbak text-lg font-normal text-baoWhite text-opacity-50'>APY</th>
											{isDesktop && (
												<th className='w-[15%] rounded-tr-lg p-2 px-4 text-center font-bakbak text-lg font-normal text-baoWhite text-opacity-50'>
													Strategy
												</th>
											)}
										</tr>
									</thead>
									<tbody>
										{composition
											.sort((a, b) => (a.percentage.lt(b.percentage) ? 1 : -1))
											.map(component => {
												return (
													<tr key={component.symbol} className='even:'>
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
															<Badge className='bg-transparent-100 font-semibold'>${getDisplayBalance(component.price)}</Badge>
														</td>
														<td className='p-2 text-center'>
															<Tooltipped content={component.apy ? `${new BN(formatUnits(component.apy.mul(100))).toFixed(8)}%` : '-'}>
																<a>
																	<Badge className='bg-baoRed font-semibold'>
																		{component.apy ? `${getDisplayBalance(component.apy.mul(100))}%` : '-'}
																	</Badge>
																</a>
															</Tooltipped>
														</td>
														{isDesktop && (
															<td className='p-2 text-center'>
																<Badge className='bg-baoRed font-semibold'>{component.strategy || 'None'}</Badge>
															</td>
														)}
													</tr>
												)
											})}
									</tbody>
								</table>
							</div>
						</div>
					) : (
						<PageLoader />
					)}
				</div>
			</>
		</>
	)
}

export default Composition
