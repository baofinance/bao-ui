import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { Progress } from '@/components/ProgressBar'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useState } from 'react'
import { isDesktop } from 'react-device-detect'
import GaugeModal from './GaugeModal'

type GaugeProps = {
	gauge: any
	apr: any
	weight: any
	tvl: string
}

const Gauges: React.FC<GaugeProps> = ({ gauge, apr, weight, tvl }) => {
	const [showGaugeModal, setShowGaugeModal] = useState(false)

	return (
		<>
			<Button fullWidth onClick={() => setShowGaugeModal(true)}>
				Vote
			</Button>
			<div className='mt-4 mb-2 flex flex-row'>
				<div className='flex flex-row items-center justify-center'>
					<Typography variant='h3' className='float-left mr-2 inline font-semibold'>
						Gauge Allocations
					</Typography>
				</div>
			</div>
			<>
				<div className='rounded border border-primary-300 bg-primary-200'>
					<table className='w-full'>
						<thead>
							<tr className='rounded-t-lg bg-primary-100'>
								<th className='w-2/12 rounded-tl-lg p-2 text-start font-bold'>Pair</th>
								<th className='w-3/12 p-2 text-start font-bold'>Allocation</th>
								<th className='w-2/12 p-2 text-end font-bold'>Boosted APR</th>
								<th className='w-3/12 p-2 text-end font-bold'>Gauge Weight</th>
								<th className='w-2/12 rounded-tr-lg p-2 px-4 text-end font-bold'>TVL</th>
							</tr>
						</thead>
						<tbody className={`${isDesktop ? 'text-base' : 'text-sm'}`}>
							<tr key={'bSTBL-DAI'} className='even:bg-primary-100'>
								<td className='p-2 text-start'>
									<div className='mx-0 my-auto inline-block h-full items-center'>
										<div className='mr-2 inline-block'>
											<Image
												className='z-10 inline-block select-none'
												src={'/images/tokens/bSTBL.png'}
												alt={'bSTBL'}
												width={24}
												height={24}
											/>
											<Image
												className='z-20 -ml-2 inline-block select-none'
												src={'/images/tokens/DAI.png'}
												alt={'DAI'}
												width={24}
												height={24}
											/>
										</div>
										<span className='inline-block text-left align-middle'>
											<Typography variant='base' className='font-bold'>
												bSTBL-DAI
											</Typography>
										</span>
									</div>
								</td>
								<td className='p-2'>
									<Progress width={(75 / 100) * 100} label={`75%`} assetColor={'#febe44'} />
								</td>
								<td className='p-2 text-end'>
									<Badge className='bg-primary-300 font-semibold'>6.9%</Badge>
								</td>
								<td className='p-2 text-end'>
									<Tooltipped content={`Gauge Weight`}>
										<a>
											<Badge className='bg-primary-300 font-semibold'>495948801.90</Badge>
										</a>
									</Tooltipped>
								</td>
								<td className='p-2 text-end'>
									<Badge className='bg-primary-300 font-semibold'>$420,690,420</Badge>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<GaugeModal show={showGaugeModal} onHide={() => setShowGaugeModal(false)} />
			</>
		</>
	)
}

export default Gauges
