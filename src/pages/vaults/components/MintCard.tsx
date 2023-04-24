import { ActiveSupportedVault } from '@/bao/lib/types'
import Input from '@/components/Input'
import Typography from '@/components/Typography'
import { AccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useBorrowBalances } from '@/hooks/vaults/useBalances'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, FixedNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import { DebtLimitRemaining, MintDetails } from './Stats'
import VaultButton from './VaultButton'
import { StatBlock } from '@/components/Stats'
import useBao from '@/hooks/base/useBao'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import useHealthFactor from '@/hooks/vaults/useHealthFactor'
import Card from '@/components/Card/Card'

export const MintCard = ({
	vaultName,
	synth,
	prices,
	accountLiquidity,
}: {
	vaultName: string
	prices: any
	accountLiquidity: AccountLiquidity
	synth: ActiveSupportedVault
}) => {
	const bao = useBao()
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

	const change = val ? decimate(parseUnits(val).mul(synth.price)) : BigNumber.from(0)
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(exponentiate(accountLiquidity.usdBorrowable)) : BigNumber.from(0)
	const newBorrowable = synth && decimate(borrowable).add(BigNumber.from(parseUnits(formatUnits(change, 36 - synth.underlyingDecimals))))

	const healthFactor = useHealthFactor(vaultName)

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

	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Mint
			</Typography>
			<Card className='border-0 bg-opacity-0 shadow-none'>
				<Card.Header>
					<div className='m-4 flex w-full gap-4 rounded-full border border-baoRed bg-baoWhite bg-opacity-5 p-1'>
						<div>
							<div className='m-1 flex w-36 justify-center rounded-full border-none bg-baoWhite bg-opacity-5 p-1'>
								<div className='justify-center py-2 text-baoWhite'>
									<div className='m-auto h-full justify-center'>
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
							className='mt-1'
						/>
						<div className='w-64 p-1'>
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
				</Card.Header>
				<Card.Body>
					{account && (
						<>
							<div className='mb-4 flex flex-col gap-4 rounded'>
								<StatBlock
									className='flex basis-1/2 flex-col'
									stats={[
										{
											label: `Current ${synth.underlyingSymbol} Price`,
											value: `$${getDisplayBalance(synth.price)}`,
										},
										{
											label: 'Total Debt',
											value: `${getDisplayBalance(synth.totalBorrows)} ${synth.underlyingSymbol}`,
										},
										{
											label: 'Total Debt USD',
											value: `$${getDisplayBalance(decimate(synth.totalBorrows.mul(synth.price)), synth.underlyingDecimals)}`,
										},
										{
											label: 'Total Collateral USD',
											value: `-`,
										},
										{
											label: 'Minimum Borrow',
											value: `${synth.minimumBorrow ? synth.minimumBorrow.toLocaleString() : '-'} ${
												synth.minimumBorrow ? synth.underlyingSymbol : ''
											}`,
										},
										{
											label: 'Max Mintable',
											value: `${getDisplayBalance(maxMintable ? maxMintable : 0)} ${synth.underlyingSymbol}`,
										},
									]}
								/>
								{/* <StatBlock
									className='flex basis-1/2 flex-col'
									label='User Info'
									stats={[
										{
											label: 'Your Collateral USD',
											value: `$${
												bao && account && accountLiquidity
													? getDisplayBalance(decimate(BigNumber.from(accountLiquidity.usdSupply.toString())), 18, 2)
													: 0
											}`,
										},
										{
											label: 'Your Debt',
											value: `${accountLiquidity ? getDisplayBalance(borrowed) : 0} ${synth.underlyingSymbol}`,
										},
										{
											label: 'Your Debt USD',
											value: `$${accountLiquidity ? getDisplayBalance(decimate(accountLiquidity.usdBorrow), 18, 2) : 0}`,
										},
										{
											label: 'Debt Limit Remaining',
											value: `$${getDisplayBalance(
												accountLiquidity ? accountLiquidity.usdBorrowable : BigNumber.from(0),
											)} ➜ $${getDisplayBalance(accountLiquidity ? accountLiquidity.usdBorrowable.sub(change) : BigNumber.from(0))}`,
										},
										{
											// FIXME: Fix this for when a users current borrow amount is zero
											label: 'Debt Limit Used',
											value: `${getDisplayBalance(
												accountLiquidity && !borrowable.eq(0) ? accountLiquidity.usdBorrow.div(decimate(borrowable)).mul(100) : 0,
												18,
												2,
											)}% ➜ ${getDisplayBalance(
												accountLiquidity && !newBorrowable.eq(0) ? accountLiquidity.usdBorrow.div(newBorrowable).mul(100) : 0,
												18,
												2,
											)}%`,
										},
										{
											label: `Debt Health`,
											value: `${
												healthFactor &&
												(healthFactor.lte(BigNumber.from(0))
													? '-'
													: healthFactor.gt(parseUnits('10000'))
													? '∞'
													: getDisplayBalance(healthFactor))
											}`,
										},
									]}
								/> */}
							</div>
						</>
					)}
				</Card.Body>
			</Card>
		</>
	)
}

export default MintCard
