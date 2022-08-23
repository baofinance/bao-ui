import { AssetBadge, CompositionBadge, StyledBadge } from '@/components/Badge/Badge'
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
import Image from 'next/image'
import React, { useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'

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
			<div className='mb-2 flex flex-row'>
				<div className='flex flex-row items-center justify-center'>
					<Typography variant='h3' className='font-strong float-left mr-2 inline'>
						Allocation Breakdown
					</Typography>
					<div className='m-auto flex gap-2'>
						<Button size='xs' onClick={() => setDisplayType('TABLE')}>
							<FontAwesomeIcon icon={faTable} size='xs' />
						</Button>
						<Button size='xs' onClick={() => setDisplayType('PIE')}>
							<FontAwesomeIcon icon={faChartPie} size='xs' />
						</Button>
					</div>
				</div>
			</div>
			{displayType === 'TABLE' ? (
				composition ? (
					<div className='w-full rounded-lg border border-primary-300 bg-primary-100'>
						<table className='rounded-fl border-transparent w-full table-auto bg-primary-100 text-text-100'>
							<thead>
								<tr>
									<th className='w-[10%] p-2 text-center'>Token</th>
									<th className='w-[40%] p-2 text-start'>Allocation</th>
									<th className='w-[20%] p-2 text-center'>Price</th>
									<th className='w-[10%] p-2 text-center'>APY</th>
									<th className='w-[15%] p-2 px-4 text-center'>Strategy</th>
								</tr>
							</thead>
							<tbody>
								{composition
									.sort((a, b) => (a.percentage < b.percentage ? 1 : -1))
									.map((component: any) => (
										<tr key={component.symbol} className='odd:bg-primary-200 hover:bg-primary-300 odd:hover:bg-primary-400'>
											<td className='p-2 text-center'>
												<Tooltipped content={component.symbol}>
													<Image src={component.image} width={32} height={32} alt={component.symbol} />
												</Tooltipped>
											</td>
											<td className='p-2'>
												<Progress
													width={(component.percentage / maxPercentage) * 100}
													label={`${getDisplayBalance(new BigNumber(component.percentage), 0)}%`}
													assetColor={component.color}
												/>
											</td>
											<td className='p-2 text-center'>${getDisplayBalance(component.basePrice || component.price, 0)}</td>
											<td className='p-2 text-center'>
												<Tooltipped content={component.apy ? `${component.apy.div(1e18).times(100).toFixed(18)}%` : '-'}>
													{component.apy ? `${component.apy.div(1e18).times(100).toFixed(2)}%` : '-'}
												</Tooltipped>
											</td>
											<td className='p-2 text-center'>
												{component.strategy || 'None'}
											</td>
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
						</table>
					</div>
				) : (
					<>
						<div className='w-full rounded-lg border border-primary-300 bg-primary-100'>
							<table className='rounded-fl border-transparent w-full table-auto bg-primary-100 text-text-100'>
								<thead>
									<tr>
										<th className='w-[10%] p-2 text-center'>Token</th>
										<th className='w-[40%] p-2 text-start'>Allocation</th>
										<th className='w-[20%] p-2 text-center'>Price</th>
										<th className='w-[10%] p-2 text-center'>APY</th>
										<th className='w-[15%] p-2 px-4 text-center'>Strategy</th>
									</tr>
								</thead>
							</table>
							<div className='m-auto p-6 text-center align-middle'>
								<Loader />
							</div>
						</div>
					</>
				)
			) : (
				<div className='h-[500px] rounded-lg border border-primary-300 bg-primary-100'>
					<div className='flex h-full flex-row'>
						<div className='flex flex-col h-full'>
							<ParentSize>{parent => <DonutGraph width={parent.width} height={parent.height} composition={composition} />}</ParentSize>
						</div>
						<div className='m-auto flex flex-col'>
							<div className='flex flex-row'>
								{composition.map(component => (
									<div className='flex flex-col' key={component.symbol}>
										<StyledBadge color={component.color}>{component.symbol}</StyledBadge>
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
