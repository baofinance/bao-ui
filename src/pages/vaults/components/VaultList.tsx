import { ActiveSupportedVault } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import { useBorrowBalances } from '@/hooks/vaults/useBalances'
import { useVaults } from '@/hooks/vaults/useVaults'
import { getDisplayBalance } from '@/utils/numberFormat'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { isDesktop } from 'react-device-detect'

// FIXME: these components should all be using ethers.BigNumber instead of js float math

export const VaultList: React.FC = () => {
	return (
		<>
			<ListHeader headers={['Vault Name', 'Collateral Assets', 'APR']} />
			<div className='flex flex-col gap-4'>
				<VaultListItem vaultName={'baoUSD'} />
				<VaultListItem vaultName={'baoETH'} />
			</div>
		</>
	)
}

export const VaultListItem: React.FC<VaultListProps> = ({ vaultName }: VaultListProps) => {
	const _vaults = useVaults(vaultName)

	const borrowBalances = useBorrowBalances(vaultName)
	const synthVaults = useMemo(() => {
		if (!(_vaults && borrowBalances)) return
		return _vaults
			.filter(vault => vault.isSynth)
			.sort((a, b) => {
				void a
				return borrowBalances.find(balance => balance.address.toLowerCase() === b.vaultAddress.toLowerCase()).balance.gt(0) ? 1 : 0
			})
	}, [_vaults, borrowBalances])

	return (
		synthVaults && (
			<Link href={`/vaults/${vaultName}`} key={vaultName}>
				<button className='w-full rounded border border-primary-300 bg-primary-100 p-4 py-2 hover:bg-primary-200'>
					<div className='flex w-full flex-row'>
						<div className='flex w-full'>
							<div className='my-auto'>
								<Image src={`/images/tokens/${vaultName}.png`} alt={vaultName} className={`inline-block`} height={32} width={32} />
								<span className='inline-block text-left align-middle'>
									<Typography className='ml-2 font-bold'>{vaultName}</Typography>
									{isDesktop && (
										<Typography variant='sm' className={`ml-2 font-light text-text-200`}>
											Placeholder text.
										</Typography>
									)}
								</span>
							</div>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>Collateral Assets</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end justify-center'>
							<span className='inline-block'>
								{synthVaults[0] ? (
									<>
										<Typography variant='sm' className='m-0 font-semibold leading-5'>
											{getDisplayBalance(synthVaults[0].borrowApy)}%
										</Typography>
										<Badge className='bg-green text-xs font-medium'>0% Fee</Badge>
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

type VaultListItemProps = {
	vault: ActiveSupportedVault
	vaultName: string
	accountVaults?: ActiveSupportedVault[]
}
