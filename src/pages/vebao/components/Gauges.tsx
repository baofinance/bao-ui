import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useGaugeAllocation from '@/hooks/vebao/useGaugeAllocation'
import useGaugeInfo from '@/hooks/vebao/useGaugeInfo'
import useGauges from '@/hooks/vebao/useGauges'
import useGaugeWeight from '@/hooks/vebao/useGaugeWeight'
import useMintable from '@/hooks/vebao/useMintable'
import useVirtualPrice from '@/hooks/vebao/useVirtualPrice'
import GraphUtil from '@/utils/graph'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import BigNumber from 'bignumber.js'
import Image from 'next/future/image'
import React, { useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import GaugeModal from './GaugeModal'

const GaugeList: React.FC = () => {
	const bao = useBao()
	const gauges = useGauges()

	return (
		<>
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
								<th className='rounded-tl-lg p-2 text-start font-bold'>Gauge</th>
								<th className='p-2 text-end font-bold'>Gauge Weight</th>
								<th className='p-2 text-end font-bold'>Relative Weight</th>
								<th className='p-2 text-end font-bold'>Current APY</th>
							</tr>
						</thead>
						<tbody className={`${isDesktop ? 'text-base' : 'text-sm'}`}>
							{gauges && gauges.map(gauge => <Gauge key={gauge.gid} gauge={gauge} />)}
						</tbody>
					</table>
				</div>
			</>
		</>
	)
}

export default GaugeList

interface GaugeProps {
	gauge: ActiveSupportedGauge
}

const Gauge: React.FC<GaugeProps> = ({ gauge }) => {
	const bao = useBao()
	const [baoPrice, setBaoPrice] = useState<BigNumber | undefined>()
	const weight = useGaugeWeight(gauge.gaugeAddress)
	const relativeWeight = useGaugeAllocation(gauge.gaugeAddress)
	const gaugeInfo = useGaugeInfo(gauge)
	const totalMintable = useMintable()
	const mintable = totalMintable.times(relativeWeight)
	const virtualPrice = useVirtualPrice(gauge.poolContract)
	const gaugeTVL = gaugeInfo && gaugeInfo.totalSupply.div(10 ** 18).times(virtualPrice)
	const rewardAPY = baoPrice && baoPrice.times(mintable).div(gaugeTVL)

	const [showGaugeModal, setShowGaugeModal] = useState(false)

	useEffect(() => {
		if (!bao) return
		fetch('https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd').then(async res => {
			setBaoPrice(new BigNumber((await res.json())['curve-dao-token'].usd))
		})
	}, [bao, setBaoPrice])

	console.log(baoPrice && baoPrice.toNumber())
	console.log(getDisplayBalance(mintable.div(10 ** 18)))
	console.log(getDisplayBalance(gaugeTVL))
	console.log(getDisplayBalance(virtualPrice))

	return (
		<>
			<tr key={gauge.name} className='even:bg-primary-100' onClick={() => setShowGaugeModal(true)}>
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
				<td className='p-2 text-end'>
					<Badge className='bg-primary-300 font-semibold'>{getDisplayBalance(weight)}</Badge>
				</td>
				<td className='p-2 text-end'>
					<Badge className='bg-primary-300 font-semibold'>{getDisplayBalance(relativeWeight, 16)}</Badge>
				</td>
				<td className='p-2 text-end'>
					<Badge className='bg-primary-300 font-semibold'>
						{rewardAPY ? (
							<Typography variant='base' className='ml-2 inline-block font-medium'>
								{rewardAPY.gte(0) ? `${decimate(rewardAPY.times(new BigNumber(100)).toNumber())}%` : 'N/A'}
							</Typography>
						) : (
							<Loader />
						)}
					</Badge>
				</td>
			</tr>
			<GaugeModal gauge={gauge} show={showGaugeModal} onHide={() => setShowGaugeModal(false)} />
		</>
	)
}
