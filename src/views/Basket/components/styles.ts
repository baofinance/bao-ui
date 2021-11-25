import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Alert, Badge, Col, Row, Table } from 'react-bootstrap'
import Collapse from 'react-bootstrap/Collapse'
import styled from 'styled-components'

export const StyledAlert = styled(Alert)`
  border: none;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background-color: ${(props) => props.theme.color.primary[100]};
  text-align: center;
  color: ${(props) => props.theme.color.text[100]};
  margin: ${(props) => props.theme.spacing[3]}px auto;
  width: 80%;

  > * {
    vertical-align: middle;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    width: 90%;
  }
`

export const BasketBox = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-top: ${(props) => props.theme.spacing[6]}px;
  text-align: center;
  width: 100%;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}px) {
    width: 100%;
  }
`

export const BasketBoxHeader = styled.div`
  font-family: 'Rubik', sans-serif;
  color: ${(props) => props.theme.color.text[100]};
  margin: auto;
  font-size: 2rem;

  p {
    margin: 0;
  }

  span.badge {
    font-size: 1.25rem;
    margin-bottom: ${(props) => props.theme.spacing[3]}px;
  }

  span.smalltext {
    float: right;
    font-size: 1rem;
    margin-top: ${(props) => props.theme.spacing[3]}px;
    margin-left: ${(props) => props.theme.spacing[2]}px;
  }

  img {
    text-align: center;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    font-size: 1.5rem;
  }
`

export const CornerButtons = styled.a`
  float: right;
  top: ${(props) => props.theme.spacing[3]}px;
  right: ${(props) => props.theme.spacing[4]}px;
  font-size: 1.5rem;
  position: absolute;
  color: ${(props) => props.theme.color.text[100]};

  &:hover {
    cursor: pointer;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.mobile}px) {
    right: 10%;
  }
`

interface BasketBreakProps {
  margin: number
}

export const BasketBoxBreak = styled.hr.attrs((props: BasketBreakProps) => ({
  margin: props.margin ? `${props.margin}px auto` : '30px auto',
}))`
  margin: ${(props) => props.margin};
  width: 40%;
  background: transparent;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    display: none;
  }
`

export const BasketCornerButton = styled.a`
  float: right;
  margin-top: ${(props) => props.theme.spacing[2]}px;
  margin-right: ${(props) => props.theme.spacing[3]}px;
  font-size: 1.5rem;
  vertical-align: middle;
  color: ${(props) => props.theme.color.text[100]};

  &:hover {
    cursor: pointer;
  }
`

export const BasketAnalytics = styled(Collapse)`
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
  margin-top: ${(props) => props.theme.spacing[4]}px;
  width: 80%;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    width: 90%;
  }
`

export const BasketAnalyticsContainer = styled.div.attrs((props) => ({
  id: 'analytics-collapse',
}))``

export const GraphContainer = styled(Col)`
  width: 100%;
  height: 350px;
  margin: 0 auto ${(props) => props.theme.spacing[6]}px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  overflow: hidden;
  background: ${(props) => props.theme.color.primary[100]};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    height: 250px;
  }
`

export const PriceGraph = styled.div``

export const PieGraphRow = styled(Row)`
  height: 400px;
  width: 80%;
  margin: 0 auto;
`

export const StyledTable = styled(Table)`
  width: 100%;
  color: ${(props) => props.theme.color.text[100]};

  th {
    padding-top: ${(props) => props.theme.spacing[4]}px;
    padding-bottom: ${(props) => props.theme.spacing[4]}px;
  }

  tbody > tr {
    vertical-align: middle;

    &:hover {
      color: ${(props) => props.theme.color.text[100]} !important;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    width: 100%;

    th.strategy {
      display: none;
    }

    td.strategy {
      display: none;
    }
  }
`

export const PrefButtons = styled.div`
  margin: auto;

  > button {
    float: left;
    margin-left: ${(props) => props.theme.spacing[2]}px;
    margin-top: ${(props) => props.theme.spacing[4]}px;
    color: ${(props) => props.theme.color.text[100]};
    border-radius: ${(props) => props.theme.borderRadius}px;
    width: 48px;
    background: ${(props) => props.theme.color.primary[100]};
    border: ${(props) => props.theme.border.default};
    box-shadow: ${(props) => props.theme.boxShadow.default};
    font-weight: ${(props) => props.theme.fontWeight.strong};

    &:hover {
      color: ${(props) => props.theme.color.text[400]};
      background: ${(props) => props.theme.color.primary[100]};
      box-shadow: ${(props) => props.theme.boxShadow.hover};
    }

    &.active,
    &:active,
    &:focus {
      color: ${(props) => props.theme.color.text[400]};
      background: ${(props) => props.theme.color.primary[100]};
      box-shadow: ${(props) => props.theme.boxShadow.hover};
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    display: none;
  }
`

export const StatsRow = styled(Row)`
  width: 80%;
  margin: ${(props) => props.theme.spacing[6]}px auto;
  display: flex;
  flex-direction: row;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    width: 90%;
    background: ${(props) => props.theme.color.primary[100]};
    border-radius: ${(props) => props.theme.borderRadius}px;
    margin: ${(props) => props.theme.spacing[4]}px auto;
  }
`

export const StatCard = styled.div`
  background: ${(props) => props.theme.color.primary[100]};
  width: 90%;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing[3]}px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  font-weight: ${(props) => props.theme.fontWeight.medium};
  text-align: center;
  color: ${(props) => props.theme.color.text[100]};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    padding: ${(props) => props.theme.spacing[2]}px;
    background: transparent;
  }
`

export const StatHeader = styled.div`
font-weight: ${(props) => props.theme.fontWeight.strong};
`

export const StyledBadge = styled(Badge)`
  font-size: 1rem !important;
  color: ${(props) => props.theme.color.text[100]};
  font-weight: ${(props) => props.theme.fontWeight.medium};
`

export const PriceBadge = styled(Badge)`
  font-size: 1rem !important;
  font-weight: ${(props) => props.theme.fontWeight.medium};
  color: ${(props) => props.theme.color.text[100]};
  background-color: ${(props) => props.theme.color.primary[100]};
`

export const Icon = styled.img`
  height: 200px;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    margin-left: 0px;
  }
`

export const BasketButtons = styled.div`
  align-items: center;
  flex-grow: 1;
  margin-right: 0;
  justify-content: center;
  vertical-align: middle;
  display: flex;
  margin-top: ${(props) => props.theme.spacing[3]}px;
  margin-bottom: ${(props) => props.theme.spacing[3]}px;
  width: 80%;
`

export const BasketHeader = styled.h1`
  font-family: 'Rubik', sans-serif;
  color: ${(props) => props.theme.color.text[100]};
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
  margin-top: 0;
  font-size: 2rem;

  small {
    display: block;
    font-family: 'Rubik', sans-serif;
    font-size: 1.5rem;
    margin-top: ${(props) => props.theme.spacing[1]}px;
  }
`

export const BasketSubHeader = styled.h1`
  font-family: 'Rubik', sans-serif;
  color: ${(props) => props.theme.color.text[100]};
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
  margin-top: 0;
  font-size: 2rem;

  small {
    display: block;
    font-family: 'Rubik', sans-serif;
    font-size: 1.5rem;
    margin-top: ${(props) => props.theme.spacing[1]}px;
  }
`

export const BasketExplanation = styled.div`
  color: ${(props) => props.theme.color.text[100]};
  text-align: left;
  width: 80%;
  margin: auto;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    width: 90%;
    padding: ${(props) => props.theme.spacing[4]}px;
    margin-top: ${(props) => props.theme.spacing[4]}px;
  }
`

export const BasketList = styled.ul`
  margin-left: ${(props) => props.theme.spacing[4]}px;
`

export const QuestionIcon = styled(FontAwesomeIcon)`
  color: ${(props) => props.theme.color.text[100]};

  &:hover,
  &:focus {
    color: ${(props) => props.theme.color.text[400]};
    animation: 200ms;
    cursor: pointer;
  }
`

export const CloseButton = styled.a`
  float: right;
  top: ${(props) => props.theme.spacing[3]}px;
  right: ${(props) => props.theme.spacing[4]}px;
  font-size: 1.5rem;
  position: absolute;
  color: ${(props) => props.theme.color.primary[100]};

  &:hover {
    cursor: pointer;
  }
`

export const HidePrice = styled.div`
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    display: none;
  }
`

export const Disclaimer = styled.div`
  font-size: 1rem;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    font-size: 0.75rem;
  }
`

export interface ProgressBarProps {
  assetColor: string
  width: number
  label?: string
}

export const ProgressBar = styled.div.attrs((props: ProgressBarProps) => ({}))`
  background-color: ${(props: ProgressBarProps) => props.assetColor};
  border-radius: 5px;
  width: ${(props: ProgressBarProps) => props.width}%;
  height: 100%;
  display: inline-block;
  float: left;
`

export const OutsideLabel = styled.span`
  float: left;
  margin-left: ${(props) => props.theme.spacing[2]}px;
`
