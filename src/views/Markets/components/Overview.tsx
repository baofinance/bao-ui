import Tooltipped from "components/Tooltipped"
import { commify } from "ethers/lib/utils"
import { useAccountLiquidity } from "hooks/hard-synths/useAccountLiquidity"
import useBao from "hooks/useBao"
import React from "react"
import styled from "styled-components"
import { useWallet } from "use-wallet"
import { BorrowLimit, BorrowMeterContainer, BorrowText, Flex, HeaderWrapper, MarketHeader, MarketHeaderContainer, MarketHeaderStack, MarketHeaderSubText, MarketHeaderText, MarketTable, OverviewContainer, OverviewHeader, TableHeader } from "./styles"
import { provider } from "web3-core"

export const Overview = () => {
    const accountLiquidity = useAccountLiquidity()

    const BorrowMeter = styled.div`
	display: flex;
	width: 	${accountLiquidity ? Math.floor((accountLiquidity.usdBorrow / (accountLiquidity.usdBorrowable + accountLiquidity.usdBorrow)) * 100) : 0}%;
	height: 100%;
	border-radius: 8px;
	background-color: ${(props) => props.theme.color.secondary[900]};
	`

    return accountLiquidity ? (
        <>
            <MarketHeaderContainer>
                <TableHeader>
                    <HeaderWrapper>
                        {`${accountLiquidity
                            ? (accountLiquidity.netApy.toFixed(2))
                            : 0
                            }`} % Net APY
                    </HeaderWrapper>
                    <HeaderWrapper
                        style={{ justifyContent: 'center', textAlign: 'center' }}
                    >
                        ${`${accountLiquidity
                            ? (accountLiquidity.usdBorrow.toFixed(2))
                            : 0
                            }`} Borrowed
                    </HeaderWrapper>
                    <HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
                        ${`${accountLiquidity
                            ? (accountLiquidity.usdSupply.toFixed(2))
                            : 0
                            }`} Supplied
                    </HeaderWrapper>
                </TableHeader>
            </MarketHeaderContainer>
            <OverviewContainer>
                <OverviewHeader>
                    <BorrowLimit>
                        Borrow Limit <Tooltipped content={`Some info here.`} />
                    </BorrowLimit>
                    <BorrowText>
                        {`${accountLiquidity
                            ? (Math.floor((accountLiquidity.usdBorrow / (accountLiquidity.usdBorrowable + accountLiquidity.usdBorrow)) * 100)) : 0}`}%
                    </BorrowText>
                    <BorrowMeterContainer>
                        <BorrowMeter />
                    </BorrowMeterContainer>
                    <BorrowText>
                        ${`${accountLiquidity
                            ? (commify((accountLiquidity.usdBorrowable + accountLiquidity.usdBorrow).toFixed(2))) : '0.00'}`}
                    </BorrowText>
                </OverviewHeader>
            </OverviewContainer>
        </>
    ) : (
        <></>
    )
}

