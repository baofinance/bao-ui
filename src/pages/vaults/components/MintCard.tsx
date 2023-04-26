import { ActiveSupportedVault } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Card from '@/components/Card/Card'
import Input from '@/components/Input'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { AccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useBorrowBalances } from '@/hooks/vaults/useBalances'
import useHealthFactor from '@/hooks/vaults/useHealthFactor'
import { providerKey } from '@/utils/index'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, FixedNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import VaultButton from './VaultButton'

export const MintCard = ({
	vaultName,
	synth,
	prices,
	accountLiquidity,
	collateral,
}: {
	vaultName: string
	prices: any
	accountLiquidity: AccountLiquidity
	synth: ActiveSupportedVault
	collateral: ActiveSupportedVault[]
}) => {
	const { account, library, chainId } = useWeb3React()
	const [val, setVal] = useState<string>('')
	const borrowBalances = useBorrowBalances(vaultName)

	const { data: maxMintable } = useQuery(
		['@/hooks/base/useTokenBalance', providerKey(library, account, chainId)],
		async () => {
			const _maxMintable = await synth.underlyingContract.balanceOf(synth.vaultAddress)
			return _maxMintable
		},
		{
			placeholderData: BigNumber.from(0),
		},
	)

	const borrowed = useMemo(
		() => synth && borrowBalances.find(balance => balance.address === synth.vaultAddress).balance,
		[borrowBalances, synth],
	)

	const max = () => {
		return prices && accountLiquidity && synth.price.gt(0)
			? BigNumber.from(
					FixedNumber.from(formatUnits(accountLiquidity && accountLiquidity.usdBorrowable)).divUnsafe(
						FixedNumber.from(formatUnits(synth.price)),
					),
			  )
			: BigNumber.from(0)
	}

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const vaultTVLs = collateral.map(vault => ({ tvl: vault.liquidity.mul(vault.price) }))
	const totalCollateral = useMemo(() => vaultTVLs.reduce((acc, curr) => acc.add(curr.tvl), BigNumber.from(0)), [vaultTVLs])

	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Mint
			</Typography>
			<Card className='glassmorphic-card p-4'>
				<Card.Body>
					<div className='flex w-full gap-2 rounded-full border border-baoWhite border-opacity-20 bg-baoWhite bg-opacity-5'>
						<div>
							<div className='m-2 flex w-32 justify-center rounded-full border-none bg-baoWhite bg-opacity-5 p-1'>
								<div className='justify-center py-2 text-baoWhite'>
									<div className='h-full justify-center'>
										<div className='mr-2 inline-block'>
											<Image
												className='z-10 inline-block select-none'
												src={synth && `/images/tokens/${synth.underlyingSymbol}.png`}
												alt={synth && synth.underlyingSymbol}
												width={24}
												height={24}
											/>
										</div>
										<span className='inline-block text-left align-middle'>
											<Typography variant='lg' className='font-bakbak'>
												{synth && synth.underlyingSymbol}
											</Typography>
										</span>
									</div>
								</div>
							</div>
						</div>
						<Input
							value={val}
							onChange={handleChange}
							onSelectMax={() => setVal(formatUnits(max(), synth.underlyingDecimals))}
							className='my-1'
						/>
						<div className='m-1 mr-3'>
							<VaultButton
								vaultName={vaultName}
								operation={'Mint'}
								asset={synth}
								val={val ? parseUnits(val, synth.underlyingDecimals) : BigNumber.from(0)}
								isDisabled={
									!val ||
									(val && parseUnits(val, synth.underlyingDecimals).gt(max())) ||
									// FIXME: temporarily limit minting/borrowing to 5k baoUSD & 3 baoETH.
									(val &&
										borrowed.lt(parseUnits(vaultName === 'baoUSD' ? '5000' : '3')) &&
										parseUnits(val, synth.underlyingDecimals).lt(parseUnits(vaultName === 'baoUSD' ? '5000' : '3')))
								}
							/>
						</div>
					</div>
					<Typography variant='xl' className='p-4 text-center font-bakbak text-baoWhite text-opacity-50'>
						Vault Info
					</Typography>
					<div className='flex flex-col gap-4 rounded'>
						<StatBlock
							className='flex basis-1/2 flex-col'
							stats={[
								{
									label: `Current ${synth.underlyingSymbol} Price`,
									value: (
										<>
											<Typography className='inline-block align-middle font-bold'>${getDisplayBalance(synth.price)}</Typography>
										</>
									),
								},
								{
									label: 'Total Debt',
									value: (
										<>
											<Typography className='inline-block align-middle font-bold'>{getDisplayBalance(synth.totalBorrows)}</Typography>
											<Image
												className='z-10 ml-1 inline-block select-none'
												src={synth && `/images/tokens/${synth.underlyingSymbol}.png`}
												alt={synth && synth.underlyingSymbol}
												width={16}
												height={16}
											/>
											<Badge className='ml-2 inline-block rounded-full bg-baoRed align-middle'>
												${getDisplayBalance(decimate(synth.totalBorrows.mul(synth.price)), synth.underlyingDecimals)}
											</Badge>
										</>
									),
								},
								{
									label: 'Total Collateral',
									value: (
										<>
											<Typography className='inline-block align-middle font-bold'>
												${getDisplayBalance(decimate(totalCollateral))}
											</Typography>
										</>
									),
								},
								{
									label: 'Minimum Mint',
									value: (
										<>
											<Typography className='inline-block align-middle font-bold'>
												{synth.minimumBorrow ? synth.minimumBorrow.toLocaleString() : '-'}{' '}
												{synth.minimumBorrow ? synth.underlyingSymbol : ''}
											</Typography>
										</>
									),
								},
								{
									label: 'Max Mintable',
									value: (
										<>
											<Typography className='inline-block align-middle font-bold'>
												{getDisplayBalance(maxMintable ? maxMintable : 0)} {synth.underlyingSymbol}
											</Typography>
										</>
									),
								},
							]}
						/>
					</div>
				</Card.Body>
			</Card>
		</>
	)
}

export default MintCard
