import { ActiveSupportedVault } from '@/bao/lib/types'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import useHealthFactor from '@/hooks/vaults/useHealthFactor'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar'
import { isDesktop } from 'react-device-detect'

type OverviewProps = {
	title?: string
	asset: ActiveSupportedVault
	amount?: string
	vaultName: string
	mintVal: string
	depositVal: string
}

const Overview: React.FC<OverviewProps> = ({ asset, amount, vaultName, mintVal, depositVal }: OverviewProps) => {
	const bao = useBao()
	const { account } = useWeb3React()
	const accountLiquidity = useAccountLiquidity(vaultName)

	const change = mintVal && depositVal ? BigNumber.from(mintVal).sub(BigNumber.from(depositVal)) : BigNumber.from(0)
	const borrow = accountLiquidity ? accountLiquidity.usdBorrow : BigNumber.from(0)
	const newBorrow = borrow ? borrow.sub(change.gt(0) ? change : 0) : BigNumber.from(0)
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(exponentiate(accountLiquidity.usdBorrowable)) : BigNumber.from(0)
	const newBorrowable = asset && decimate(borrowable).sub(BigNumber.from(parseUnits(formatUnits(change, 36 - asset.underlyingDecimals))))

	const borrowChange = borrow.add(exponentiate(change))
	const healthFactor = useHealthFactor(vaultName, borrowChange)

	const borrowLimit =
		accountLiquidity && !accountLiquidity.usdBorrow.eq(0)
			? accountLiquidity.usdBorrow.div(accountLiquidity.usdBorrowable.add(accountLiquidity.usdBorrow)).mul(100)
			: BigNumber.from(0)

	const healthFactorColor = (healthFactor: BigNumber) => {
		const c = healthFactor.eq(0)
			? `${(props: any) => props.theme.color.text[100]}`
			: healthFactor.lte(parseUnits('1.25'))
			? '#e32222'
			: healthFactor.lt(parseUnits('1.55'))
			? '#ffdf19'
			: '#45be31'
		return c
	}

	return accountLiquidity ? (
		<>
			<div className={`mx-auto my-4 grid grid-cols-5 items-center justify-evenly gap-4`}>
				<div className='glassmorphic-card col-span1 w-fit !px-8 !py-6 lg:px-3 lg:py-2'>
					<div className='break-words text-center'>
						<Typography variant='base' className='font-bakbak text-baoRed'>
							Net APY
						</Typography>
						<Typography variant='h3' className='font-bakbak'>
							{`${accountLiquidity ? getDisplayBalance(accountLiquidity.netApy) : 0}`}%
						</Typography>
					</div>
				</div>
				<div className='glassmorphic-card col-span1 w-fit !px-8 !py-6 lg:px-3 lg:py-2'>
					<div className='break-words text-center'>
						<Typography variant='base' className='font-bakbak text-baoRed'>
							Your Collateral
						</Typography>
						<Typography variant='h3' className='font-bakbak'>
							$
							{`${
								bao && account && accountLiquidity
									? getDisplayBalance(decimate(BigNumber.from(accountLiquidity.usdSupply.toString())), 18, 2)
									: 0
							}`}
						</Typography>
					</div>
				</div>

				{isDesktop && (
					<div className='glassmorphic-card col-span1 py-12'>
						<div className='m-auto w-[15vh]'>
							<CircularProgressbarWithChildren
								value={parseFloat(
									getDisplayBalance(
										accountLiquidity && newBorrowable && !newBorrowable.eq(0)
											? (parseFloat(accountLiquidity.usdBorrow.toString()) / parseFloat(newBorrowable.toString())) * 100
											: 0,
										18,
										2,
									),
								)}
								strokeWidth={10}
								styles={buildStyles({
									strokeLinecap: 'butt',
									pathColor: `${healthFactor ? healthFactorColor(healthFactor) : '#fff'}`,
								})}
							>
								<div className='max-w-[16.6666666667%] basis-[16.6666666667%]'>
									<div className='relative left-1/2 h-[130px] w-[130px] -translate-x-1/2 rounded-full'>
										<div
											className='absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center rounded-full p-1'
											style={{ marginTop: '10px' }}
										>
											<Typography variant='xs' className='font-medium text-baoWhite'>
												Debt Limit
											</Typography>
											<Typography variant='sm' className='font-bold text-baoWhite'>
												{getDisplayBalance(
													accountLiquidity && newBorrowable && !newBorrowable.eq(0)
														? accountLiquidity.usdBorrow.div(newBorrowable).mul(100)
														: 0,
													18,
													0,
												)}
												{'%'}
											</Typography>
										</div>
									</div>
								</div>
							</CircularProgressbarWithChildren>
						</div>{' '}
					</div>
				)}

				<div className='glassmorphic-card col-span1 m-auto mr-0 w-fit !px-8 !py-6 lg:px-3 lg:py-2'>
					<div className='break-words text-center'>
						<Typography variant='base' className='font-bakbak text-baoRed'>
							Total Debt
						</Typography>
						<Typography variant='h3' className='font-bakbak'>
							${`${accountLiquidity ? getDisplayBalance(decimate(accountLiquidity.usdBorrow), 18, 2) : 0}`}
						</Typography>
					</div>
				</div>
				<div className='glassmorphic-card col-span1 m-auto mr-0 w-fit !px-8 !py-6 lg:px-3 lg:py-2'>
					<div className='break-words text-center'>
						<Typography variant='base' className='font-bakbak text-baoRed'>
							Health Factor{' '}
							<Tooltipped
								className='glassmorphic-card !rounded-lg'
								content='Your account health factor is calculated as follows: ∑(collateral_usd * collateral_factor) / borrowed_usd. A health factor below 1.0 means you have exceeded your borrow limit and you will be liquidated.'
							/>
						</Typography>
						<Typography variant='h3' className='font-bakbak'>
							{' '}
							{healthFactor &&
								// FIXME: ethers.BigNumber does not end up as infinite ever.
								//(healthFactor.isFinite() ? (
								//	healthFactor.lte(0) ? (
								//		'-'
								//	) : healthFactor.gt(10000) ? (
								//		<p>
								//			{'>'} 10000 <Tooltipped content={`Your health factor is ${healthFactor}.`} />
								//		</p>
								//	) : (
								//		getDisplayBalance(healthFactor)
								//	)
								//) : (
								//	<FontAwesomeIcon icon={faInfinity} />
								//))
								healthFactor &&
								(healthFactor.lte(0) ? (
									'-'
								) : parseFloat(formatUnits(healthFactor)) > 10000 ? (
									<p>
										{'>'} 10000 <Tooltipped content={`Your health factor is ${formatUnits(healthFactor)}.`} />
									</p>
								) : (
									getDisplayBalance(healthFactor)
								))}
						</Typography>
					</div>
				</div>
			</div>

			{!isDesktop && (
				<div className='w-full'>
					<div className='mt-4 flex w-full justify-center rounded border p-4'>
						<div className='flex w-full flex-row items-center justify-center text-sm font-medium'>
							<div className='flex flex-row items-center gap-2'>
								<Typography variant='sm' className='flex whitespace-nowrap text-sm font-medium text-baoRed'>
									Debt Limit
								</Typography>
								<Typography variant='sm' className='m-0 ml-2'>
									{`${
										accountLiquidity.usdBorrowable.gt(0)
											? accountLiquidity.usdBorrow.div(accountLiquidity.usdBorrowable.add(accountLiquidity.usdBorrow)).mul(100)
											: 0
									}%`}{' '}
								</Typography>
							</div>

							<div className='bg-primary-400 ml-2 flex h-1 w-full rounded'>
								<div className='bg-text-100 flex rounded' style={{ width: `${borrowLimit}%` }} />
							</div>

							<div className='flex flex-row items-center'>
								<Typography variant='sm' className='m-0 mx-2'>
									${`${getDisplayBalance(borrowable, 0)}`}
								</Typography>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	) : (
		<></>
	)
}

export default Overview
