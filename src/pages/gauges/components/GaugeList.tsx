import { ActiveSupportedGauge } from '@/bao/lib/types'
import { ListHeader } from '@/components/List'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import usePrice from '@/hooks/base/usePrice'
import useGaugeInfo from '@/hooks/gauges/useGaugeInfo'
import useGaugeTVL from '@/hooks/gauges/useGaugeTVL'
import useGauges from '@/hooks/gauges/useGauges'
import useMintable from '@/hooks/gauges/useMintable'
import useRelativeWeight from '@/hooks/gauges/useRelativeWeight'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useVeInfo from '@/hooks/vebao/useVeInfo'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import GaugeModal from './Modals'

const GaugeList: React.FC = () => {
	const gauges = useGauges()

	return (
		<>
			<ListHeader headers={['Gauge Name', 'Current Weight', 'APR', 'TVL']} />
			<div className='flex flex-col gap-4'>
				{gauges.length ? (
					gauges.map((gauge: ActiveSupportedGauge, i: number) => (
						<React.Fragment key={i}>
							<GaugeListItem gauge={gauge} />
						</React.Fragment>
					))
				) : (
					<PageLoader block />
				)}
			</div>
		</>
	)
}

interface GaugeListItemProps {
	gauge: ActiveSupportedGauge
}

const GaugeListItem: React.FC<GaugeListItemProps> = ({ gauge }) => {
	const { account } = useWeb3React()
	const [showGaugeModal, setShowGaugeModal] = useState(false)
	const { currentWeight } = useRelativeWeight(gauge.gaugeAddress)
	const baoPrice = usePrice('bao-finance-v2')

	const mintable = useMintable()
	const { gaugeTVL, depositAmount } = useGaugeTVL(gauge)
	const rewardsValue = baoPrice ? baoPrice.mul(mintable) : BigNumber.from(0)
	const rewardsAPR = gaugeTVL && gaugeTVL.gt(0) ? rewardsValue.mul(currentWeight).div(gaugeTVL).mul(100).toString() : BigNumber.from(0)

	const gaugeInfo = useGaugeInfo(gauge)
	const veInfo = useVeInfo()

	const lockInfo = useLockInfo()
	const veEstimate = lockInfo ? parseFloat(formatUnits(lockInfo.balance)) : 0
	const totalVePower = veInfo ? parseFloat(formatUnits(veInfo.totalSupply)) : 0
	const tvl = parseFloat(formatUnits(decimate(gaugeTVL ? gaugeTVL : BigNumber.from(0))))

	const boost = useMemo(() => {
		const _depositAmount = depositAmount ? formatUnits(decimate(depositAmount)) : '0'
		const l = parseFloat(_depositAmount) * 1e18
		const working_balances = gaugeInfo && account ? parseFloat(gaugeInfo.workingBalance.toString()) : 1 * 1e18 //determine workingBalance of depositAmount
		const working_supply = gaugeInfo && parseFloat(gaugeInfo.workingSupply.toString())
		const L = tvl * 1e18 + l
		const lim = (l * 40) / 100
		const veBAO = veEstimate * 1e18
		const limplus = lim + (L * veBAO * 60) / (totalVePower * 1e20)
		const limfinal = Math.min(l, limplus)
		const old_bal = working_balances
		const noboost_lim = (l * 40) / 100
		const noboost_supply = working_supply + noboost_lim - old_bal
		const _working_supply = working_supply + limfinal - old_bal
		const boost = limfinal / _working_supply / (noboost_lim / noboost_supply)

		return boost
	}, [account, depositAmount, gaugeInfo, totalVePower, tvl, veEstimate])

	return (
		<>
			<button
				className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
				onClick={() => setShowGaugeModal(true)}
				disabled={!account}
			>
				<div className='flex w-full flex-row'>
					<div className='flex basis-1/4'>
						<div className='mx-0 my-auto inline-block h-full items-center'>
							<div className='mr-2 inline-block'>
								<Image className='z-10 inline-block select-none' src={gauge.iconA} alt={gauge.symbol} width={32} height={32} />
								<Image className='z-20 -ml-2 inline-block select-none' src={gauge.iconB} alt={gauge.symbol} width={32} height={32} />
							</div>
							<span className='inline-block text-left align-middle'>
								<Typography variant='base' className='font-bakbak'>
									{gauge.name}
								</Typography>
								<Typography className={`flex align-middle font-bakbak text-baoRed`}>
									<Image src={`/images/platforms/${gauge.type}.png`} height={16} width={16} alt={gauge.type} className='mr-1 inline' />
									{gauge.type}
								</Typography>
							</span>
						</div>
					</div>

					<div className='mx-auto my-0 flex basis-1/4 items-center justify-center'>
						<Typography variant='base' className='ml-2 inline-block font-bakbak'>
							{getDisplayBalance(currentWeight.mul(100), 18, 2)}%
						</Typography>
					</div>

					<div className='mx-auto my-0 flex basis-1/4 items-center justify-center'>
						<Typography variant='base' className='ml-2 inline-block font-bakbak'>
							{getDisplayBalance(isNaN(boost) ? rewardsAPR : parseFloat(rewardsAPR.toString()) * boost)}%
						</Typography>
					</div>

					<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right'>
						<Typography variant='base' className='ml-2 inline-block font-bakbak'>
							${getDisplayBalance(formatUnits(gaugeTVL ? gaugeTVL : BigNumber.from(0)))}
						</Typography>
					</div>
				</div>
			</button>
			<GaugeModal gauge={gauge} tvl={gaugeTVL} rewardsValue={rewardsValue} show={showGaugeModal} onHide={() => setShowGaugeModal(false)} />
		</>
	)
}

export default GaugeList
