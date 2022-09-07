import { ActiveSupportedGauge } from '@/bao/lib/types'
import { getGaugeControllerContract } from '@/bao/utils'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { Progress } from '@/components/ProgressBar'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useGaugeAllocation from '@/hooks/vebao/useGaugeAllocation'
import useGauges from '@/hooks/vebao/useGauges'
import useGaugeWeight from '@/hooks/vebao/useGaugeWeight'
import { getDisplayBalance } from '@/utils/numberFormat'
import BigNumber from 'bignumber.js'
import Image from 'next/future/image'
import React, { useState } from 'react'
import { isDesktop } from 'react-device-detect'
import GaugeModal from './GaugeModal'

const GaugeList: React.FC = () => {
	const bao = useBao()
	const [showGaugeModal, setShowGaugeModal] = useState(false)
	const gauges = useGauges()
	const gaugeControllerContract = getGaugeControllerContract(bao)

	console.log(gauges)

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
							{gauges && gauges.map(gauge => <Gauge key={gauge.gid} gauge={gauge} />)}
						</tbody>
					</table>
				</div>

				<GaugeModal show={showGaugeModal} onHide={() => setShowGaugeModal(false)} />
			</>
		</>
	)
}

export default GaugeList

interface GaugeProps {
	gauge: ActiveSupportedGauge
}

const Gauge: React.FC<GaugeProps> = ({ gauge }) => {
	const weight = useGaugeWeight(gauge.lpAddress)
	const allocation = useGaugeAllocation(gauge.lpAddress).toNumber()

	return (
		<tr key={gauge.name} className='even:bg-primary-100'>
			<td className='p-2 text-start'>
				<div className='mx-0 my-auto inline-block h-full items-center'>
					<div className='mr-2 inline-block'>
						<Image className='z-10 inline-block select-none' src={gauge.icon} alt={gauge.name} width={24} height={24} />
					</div>
					<span className='inline-block text-left align-middle'>
						<Typography variant='base' className='font-bold'>
							{gauge.name}
						</Typography>
					</span>
				</div>
			</td>
			<td className='p-2'>
				<Progress width={(allocation / 100) * 100} label={`${getDisplayBalance(allocation, 16)}%`} assetColor={'#000'} />
			</td>
			<td className='p-2 text-end'>
				<Badge className='bg-primary-300 font-semibold'>6.9%</Badge>
			</td>
			<td className='p-2 text-end'>
				<Tooltipped content={`Gauge Weight`}>
					<a>
						<Badge className='bg-primary-300 font-semibold'>{getDisplayBalance(weight)}</Badge>
					</a>
				</Tooltipped>
			</td>
			<td className='p-2 text-end'>
				<Badge className='bg-primary-300 font-semibold'>$420,690,420</Badge>
			</td>
		</tr>
	)
}
