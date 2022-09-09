import { ActiveSupportedGauge } from '@/bao/lib/types'
import { getGaugeControllerContract } from '@/bao/utils'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useGaugeAllocation from '@/hooks/vebao/useGaugeAllocation'
import useGauges from '@/hooks/vebao/useGauges'
import useGaugeWeight from '@/hooks/vebao/useGaugeWeight'
import useInflationRate from '@/hooks/vebao/useInflationRate'
import useMintable from '@/hooks/vebao/useMintable'
import useTotalSupply from '@/hooks/vebao/useTotalSupply'
import useVirtualPrice from '@/hooks/vebao/useVirtualPrice'
import { getBalanceNumber, getDisplayBalance } from '@/utils/numberFormat'
import BigNumber from 'bignumber.js'
import Image from 'next/future/image'
import React, { useEffect, useState } from 'react'
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
	const bao = useBao()
	const [baoPrice, setBaoPrice] = useState<BigNumber | undefined>()
	const weight = useGaugeWeight(gauge.gaugeAddress).toNumber()
	const relativeWeight = useGaugeAllocation(gauge.gaugeAddress).toNumber()
	const inflationRate = useInflationRate(gauge.gaugeContract).toNumber()
	const totalMintable = useMintable().toNumber()
	const mintable = totalMintable * relativeWeight
	const rewardTokenPrice = baoPrice && getBalanceNumber(baoPrice)
	const epochUSDRewards = mintable * rewardTokenPrice
	const totalSupply = useTotalSupply(gauge.gaugeContract)
	const virtualPrice = useVirtualPrice(gauge.poolContract)

	useEffect(() => {
		fetch('https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd').then(async res => {
			setBaoPrice(new BigNumber((await res.json())['curve-dao-token'].usd))
		})
	}, [bao, setBaoPrice])

	// const mintable = crvContract.methods.mintable_in_timeframe(currentEpoch, futureEpoch).call()
	console.log(totalSupply)
	console.log(virtualPrice)

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
			<td className='p-2 text-end'>
				<Badge className='bg-primary-300 font-semibold'>{getDisplayBalance(weight)}</Badge>
			</td>
			<td className='p-2 text-end'>
				<Badge className='bg-primary-300 font-semibold'>{getDisplayBalance(relativeWeight, 16)}</Badge>
			</td>
			<td className='p-2 text-end'>
				<Badge className='bg-primary-300 font-semibold'>{getDisplayBalance(mintable)}</Badge>
			</td>
			<td className='p-2 text-end'>
				<Badge className='bg-primary-300 font-semibold'>{getDisplayBalance(epochUSDRewards)}</Badge>
			</td>
		</tr>
	)
}
