import 'react-circular-progressbar/dist/styles.css'

import { faInfinity } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import React from 'react'
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar'
import { isDesktop } from 'react-device-detect'

import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { useAccountLiquidity } from '@/hooks/markets/useAccountLiquidity'
import useHealthFactor from '@/hooks/markets/useHealthFactor'
import { getDisplayBalance } from '@/utils/numberFormat'

export const Overview = () => {
	const bao = useBao()
	const { account } = useWeb3React()
	const accountLiquidity = useAccountLiquidity()
	const healthFactor = useHealthFactor()

	const borrowLimit =
		accountLiquidity && accountLiquidity.usdBorrow !== 0
			? Math.floor((accountLiquidity.usdBorrow / (accountLiquidity.usdBorrowable + accountLiquidity.usdBorrow)) * 100)
			: 0

	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow + accountLiquidity.usdBorrowable : 0

	const healthFactorColor = (healthFactor: BigNumber) =>
		healthFactor.eq(0)
			? `${(props: any) => props.theme.color.text[100]}`
			: healthFactor.lte(1.25)
			? '#e32222'
			: healthFactor.lt(1.55)
			? '#ffdf19'
			: '#45be31'

	return bao && account && accountLiquidity ? (
		<>
			<div className={`mx-auto my-4 grid items-center justify-evenly ${isDesktop ? 'grid-cols-5' : 'grid-cols-2'} gap-4`}>
				<div className='realtive flex h-fit min-w-[15%] flex-1 flex-col rounded border border-primary-300 bg-primary-100 px-4 py-3 lg:px-3 lg:py-2'>
					<div className='break-words text-center'>
						<Typography variant='sm' className='text-text-200'>
							Net APY
						</Typography>
						<Typography variant='base' className='font-semibold'>
							{`${bao && account && accountLiquidity ? accountLiquidity.netApy.toFixed(2) : 0}`}%
						</Typography>
					</div>
				</div>
				<div className='realtive flex h-fit min-w-[15%] flex-1 flex-col rounded border border-primary-300 bg-primary-100 px-4 py-3 lg:px-3 lg:py-2'>
					<div className='break-words text-center'>
						<Typography variant='sm' className='text-text-200'>
							Your Collateral
						</Typography>
						<Typography variant='base' className='font-medium'>
							${`${bao && account && accountLiquidity ? getDisplayBalance(accountLiquidity.usdSupply, 0, 2) : 0}`}{' '}
						</Typography>
					</div>
				</div>

				{isDesktop && (
					<div className='flex flex-col'>
						<div className='m-auto w-[150px]'>
							<CircularProgressbarWithChildren
								value={borrowLimit}
								strokeWidth={10}
								styles={buildStyles({
									strokeLinecap: 'butt',
									pathColor: `${healthFactor ? healthFactorColor(healthFactor) : '#fff'}`,
								})}
							>
								<div className='max-w-[16.6666666667%] basis-[16.6666666667%]'>
									<div className='relative left-1/2 h-[130px] w-[130px] -translate-x-1/2 rounded-full bg-primary-100'>
										<div
											className='absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center rounded-full p-1'
											style={{ marginTop: '15px' }}
										>
											<Typography variant='sm' className='text-text-200'>
												Debt Limit
											</Typography>
											<Typography>
												{`${
													bao && account && accountLiquidity.usdBorrowable > 0
														? Math.floor((accountLiquidity.usdBorrow / (accountLiquidity.usdBorrowable + accountLiquidity.usdBorrow)) * 100)
														: 0
												}`}
												%
											</Typography>
										</div>
									</div>
								</div>
							</CircularProgressbarWithChildren>
						</div>
					</div>
				)}

				<div className='realtive flex h-fit min-w-[15%] flex-1 flex-col rounded border border-primary-300 bg-primary-100 px-4 py-3 lg:px-3 lg:py-2'>
					<div className='break-words text-center'>
						<Typography variant='sm' className='text-text-200'>
							Total Debt
						</Typography>
						<Typography variant='base' className='font-medium'>
							${`${bao && account && accountLiquidity ? getDisplayBalance(accountLiquidity.usdBorrow, 0, 2) : 0}`}
						</Typography>
					</div>
				</div>
				<div className='realtive flex h-fit min-w-[15%] flex-1 flex-col rounded border border-primary-300 bg-primary-100 px-4 py-3 lg:px-3 lg:py-2'>
					<div className='break-words text-center'>
						<Typography variant='sm' className='text-text-200'>
							Health Factor{' '}
							<Tooltipped content='Your account health factor is calculated as follows: ∑(collateral_usd * collateral_factor) / borrowed_usd. A health factor below 1.0 means you have exceeded your borrow limit and you will be liquidated.' />
						</Typography>
						<Typography variant='base' className='font-medium'>
							{' '}
							{healthFactor &&
								(healthFactor.isFinite() ? (
									healthFactor.lte(0) ? (
										'-'
									) : healthFactor.gt(10000) ? (
										<p>
											{'>'} 10000 <Tooltipped content={`Your health factor is ${healthFactor}.`} />
										</p>
									) : (
										healthFactor.toFixed(2)
									)
								) : (
									<FontAwesomeIcon icon={faInfinity} />
								))}
						</Typography>
					</div>
				</div>
			</div>

			{!isDesktop && (
				<div className='w-full'>
					<div className='mt-4 flex w-full justify-center rounded border border-primary-300 bg-primary-100 p-4'>
						<div className='flex w-full flex-row items-center justify-center text-sm font-medium'>
							<div className='flex flex-row items-center gap-2'>
								<Typography variant='sm' className='flex whitespace-nowrap text-sm font-medium text-text-200'>
									Debt Limit
								</Typography>
								<Typography variant='sm' className='m-0 ml-2'>
									{`${
										bao && account && accountLiquidity.usdBorrowable > 0
											? Math.floor((accountLiquidity.usdBorrow / (accountLiquidity.usdBorrowable + accountLiquidity.usdBorrow)) * 100)
											: 0
									}%`}{' '}
								</Typography>
							</div>

							<div className='ml-2 flex h-1 w-full rounded bg-primary-400'>
								<div className='flex rounded bg-text-100' style={{ width: `${borrowLimit}%` }} />
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
