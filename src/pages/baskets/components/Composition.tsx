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
import { ParentSize } from '@visx/responsive'
import { BigNumber } from 'bignumber.js'
import _ from 'lodash'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'

type CompositionProps = {
	composition: BasketComponent[]
}

type DisplayType = 'TABLE' | 'PIE'

const Composition: React.FC<CompositionProps> = ({ composition }) => {
	const [displayType, setDisplayType] = useState<DisplayType>('TABLE')

	const maxPercentage = useMemo(() => {
		if (!composition) return

		return _.max(composition.map(component => component.percentage))
	}, [composition])

	return (
		<>
			<div className='mt-4 mb-2 flex flex-row'>
				<div className='flex flex-row items-center justify-center'>
					<Typography variant='h3' className='float-left mr-2 inline font-semibold'>
						Allocation Breakdown
					</Typography>
					<div className='m-auto flex gap-2'>
						<Button size='xs' onClick={() => setDisplayType('TABLE')} className='h-8 w-8'>
							<FontAwesomeIcon icon={faTable} size='xs' />
						</Button>
						<Button size='xs' onClick={() => setDisplayType('PIE')} className='h-8 w-8'>
							<FontAwesomeIcon icon={faChartPie} size='xs' />
						</Button>
					</div>
				</div>
			</div>
			{displayType === 'TABLE' ? (
				<>
					<div className='rounded-lg border border-primary-300 bg-primary-200'>
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
										.sort((a, b) => (a.percentage < b.percentage ? 1 : -1))
										.map((component: any) => (
											<tr key={component.symbol} className='even:bg-primary-100'>
												<td className='p-2 text-center'>
													<Tooltipped content={component.symbol} placement='left'>
														<a>
															<Image src={component.image} width={32} height={32} alt={component.symbol} className='inline' />
														</a>
													</Tooltipped>
												</td>
												<td className='p-2'>
													<Progress
														width={(component.percentage / maxPercentage) * 100}
														label={`${getDisplayBalance(new BigNumber(component.percentage), 0)}%`}
														assetColor={component.color}
													/>
												</td>
												<td className='p-2 text-center'>
													<Badge className='bg-primary-300 font-semibold'>
														${getDisplayBalance(component.basePrice || component.price, 0)}
													</Badge>
												</td>
												<td className='p-2 text-center'>
													<Tooltipped content={component.apy ? `${component.apy.div(1e18).times(100).toFixed(18)}%` : '-'}>
														<a>
															<Badge className='bg-primary-300 font-semibold'>
																{component.apy ? `${component.apy.div(1e18).times(100).toFixed(2)}%` : '-'}
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
										)) || (
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
				<div className='h-[500px] rounded-lg border border-primary-300 bg-primary-100'>
					<div className='flex h-full flex-row'>
						<div className='flex h-full flex-col'>
							<ParentSize>{parent => <DonutGraph width={parent.width} height={parent.height} composition={composition} />}</ParentSize>
						</div>
						<div className='m-auto flex flex-col'>
							<div className='flex flex-row'>
								{composition.map(component => (
									<div className='flex flex-col' key={component.symbol}>
										<Badge color={component.color}>{component.symbol}</Badge>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default Composition
