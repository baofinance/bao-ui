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
			<ListHeader headers={isDesktop ? ['Vault Name', 'Collateral Assets', 'Borrow vAPR'] : ['Name', 'Assets', 'vAPR']} />
			<div className='flex flex-col gap-4'>
				<VaultListItem vaultName={'baoUSD'} />
				{/* <VaultListItem vaultName={'baoETH'} /> */}
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

	return (
		synth && (
			<Link href={`/vaults/${vaultName}`} key={vaultName}>
				<button
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
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
										<Typography variant='sm' className={`ml-2 text-baoWhite`}>
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
						<div className='mx-auto my-0 flex w-full flex-col items-end justify-center'>
							<span className='inline-block'>
								{synth ? (
									<>
										<Typography variant='base' className='m-0 font-bakbak leading-5'>
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
