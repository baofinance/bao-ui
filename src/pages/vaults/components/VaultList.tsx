import { ActiveSupportedVault } from '@/bao/lib/types'
import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import { useVaults } from '@/hooks/vaults/useVaults'
import { getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { isDesktop } from 'react-device-detect'

export const VaultList: React.FC = () => {
	return (
		<>
			<ListHeader headers={['Vault Name', 'Collateral Assets', 'Borrow vAPR']} />
			<div className='flex flex-col gap-4'>
				<VaultListItem vaultName={'baoUSD'} />
				<VaultListItem vaultName={'baoETH'} />
			</div>
		</>
	)
}

export const VaultListItem: React.FC<VaultListProps> = ({ vaultName }: VaultListProps) => {
	const { account } = useWeb3React()
	const _vaults = useVaults(vaultName)

	const synth = useMemo(() => {
		return _vaults?.find(vault => vault.isSynth)
	}, [_vaults])

	const collateral = useMemo(() => {
		return _vaults?.filter(vault => !vault.isSynth)
	}, [_vaults])

	// FIXME: this is a hack to get the average APY of the basket
	// const baskets = useBaskets()
	// const basket = useMemo(() => {
	// 	if (!baskets) return
	// 	return baskets.find(basket => basket.symbol === 'bSTBL')
	// }, [baskets])
	// const info = useBasketInfo(basket)
	// const composition = useComposition(basket)
	// const avgBasketAPY =
	// 	composition &&
	// 	(composition
	// 		.map(function (component) {
	// 			return component.apy
	// 		})
	// 		.reduce(function (a, b) {
	// 			return a + parseFloat(formatUnits(b))
	// 		}, 0) /
	// 		composition.length) *
	// 		100

	// const allCollateralAPY = collateral && collateral.map(() => avgBasketAPY && avgBasketAPY)
	// const maxAPY = allCollateralAPY ? Math.max(...allCollateralAPY) : 0
	// const minAPY = allCollateralAPY ? Math.min(...allCollateralAPY) : 0

	return (
		synth && (
			<Link href={`/vaults/${vaultName}`} key={vaultName}>
				<button
					className='hover:bg-primary-200 w-full rounded bg-transparent-100 px-4 py-2 text-baoWhite hover:bg-baoBlack'
					disabled={!account}
				>
					<div className='flex w-full flex-row'>
						<div className='flex w-full'>
							<div className='my-auto'>
								<Image src={`/images/tokens/${vaultName}.png`} alt={vaultName} className={`inline-block`} height={32} width={32} />
								<span className='inline-block text-left align-middle'>
									<Typography variant='lg' className='ml-2 font-bakbak'>
										{vaultName}
									</Typography>
									{isDesktop && (
										<Typography variant='base' className={`ml-2 font-semibold text-baoRed`}>
											{synth.desc}
										</Typography>
									)}
								</span>
							</div>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							{collateral ? (
								collateral.map((vault: ActiveSupportedVault) => (
									<Tooltipped content={vault.underlyingSymbol} key={vault.underlyingSymbol} placement='bottom'>
										<span className={`-ml-2 inline-block select-none duration-200 first:ml-0`}>
											<Image
												src={`/images/tokens/${vault.icon}`}
												alt={vaultName}
												key={vaultName}
												className={`inline-block`}
												height={32}
												width={32}
											/>
										</span>
									</Tooltipped>
								))
							) : (
								<Loader />
							)}
						</div>
						{/* 
						FIXME: this is a placeholder for the APY range
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							<Typography variant='sm' className='m-0 font-semibold'>
								{collateral ? '0 - ' + getDisplayBalance(maxAPY, 0, 2) + '%' : <Loader />}
							</Typography>
						</div> 
						*/}

						<div className='mx-auto my-0 flex w-full flex-col items-end justify-center'>
							<span className='inline-block'>
								{synth ? (
									<>
										<Typography variant='sm' className='m-0 font-semibold leading-5'>
											{getDisplayBalance(synth.borrowApy)}%
										</Typography>
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
	)
}

export default VaultList

type VaultListProps = {
	vaultName: string
}
