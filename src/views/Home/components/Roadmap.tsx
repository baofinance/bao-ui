import React from 'react'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component'
import './verticaltimeline.css'
import styled from 'styled-components'

const RoadmapHeader = styled.h3`
  color: #50251c;
  margin: 0;
`

const RoadmapSubHeader = styled.h4`
  color: #ce6509;
  margin: 0;
`

const RoadmapDesc = styled.p`
  color: #50251c;
`

const RoadMap = () => {
  return (
    <VerticalTimeline>
      <VerticalTimelineElement className="vertical-timeline-element--work">
        <RoadmapHeader>Bao Finance Launches</RoadmapHeader>
        <RoadmapSubHeader>Ethereum Mainnet</RoadmapSubHeader>
        <RoadmapDesc>Bao Finance launches on Ethereum Mainnet.</RoadmapDesc>
      </VerticalTimelineElement>
      <VerticalTimelineElement className="vertical-timeline-element--work" date="Q4 2020">
        <RoadmapHeader>Token Distribution</RoadmapHeader>
        <RoadmapSubHeader>Yield Farming Begins</RoadmapSubHeader>
        <RoadmapDesc>
          During the yield farming phase, users will earn rewards each block for staking their LP tokens in the Bao
          Finance farming protocol. During this one year period we will distribute 800 billion bao. BAO has a broad
          distribution, rewarding over 200 market assets creating the most diverse yield farming distribution in history
          so that everyone can participate with minimal risk of monopolies.
        </RoadmapDesc>
      </VerticalTimelineElement>
      <VerticalTimelineElement className="vertical-timeline-element--work" date="Q1 2021">
        <RoadmapHeader>xDai Migration, BaoSwap & Co</RoadmapHeader>
        <RoadmapSubHeader>Sidechain Deployment & Franchise Announcement</RoadmapSubHeader>
        <RoadmapDesc>
          BaoSwap launches on xDai sidechain along with the ability to yield farm with BaoSwap or Sushiswap LP tokens.
          Bao Finance franchises announced. Franchises provide an opportunity to capture new liquidity and value for the
          Bao ecosystem without adding extra overhead and without competing with our partners. Bao’s xDai ecosystem will
          still be our primary and top priority.
        </RoadmapDesc>
      </VerticalTimelineElement>
      <VerticalTimelineElement className="vertical-timeline-element--work" date="Q2 2021">
        <RoadmapHeader>Pandaswap Franchise Launch</RoadmapHeader>
        <RoadmapSubHeader>First Franchise Launches on Binance Smart Chain</RoadmapSubHeader>
        <RoadmapDesc>
          Pandaswap, the first Bao Finance franchise, launches on Binance Smart Chain. Along with PNDA, Pandaswap
          introduced two new tokens to the BAO ecosystem - RHINO, an experimental deflationary token, and BAMBOO, which
          users receive in exchange for staking their PNDA tokens in the BambooBar. BAMBOO appreciates in value by
          collecting fees from the exchange platform.
        </RoadmapDesc>
      </VerticalTimelineElement>
      <VerticalTimelineElement className="vertical-timeline-element--work" date="Q3 2021">
        <RoadmapHeader>Polygon Franchise & Debut of Soft Synthetics</RoadmapHeader>
        <RoadmapSubHeader>Launch of Soft Synthetics on Polygon Network</RoadmapSubHeader>
        <RoadmapDesc>
          Soft synthetics, or nests, will be configured pools of assets where users are able to get balanced exposure to
          a basket of assets by holding one token. Nests will utilize an asset manager that will allow for complex
          strategies including lending and staking. This will be further incentivized with yield farming opportunities.
        </RoadmapDesc>
      </VerticalTimelineElement>
      <VerticalTimelineElement className="vertical-timeline-element--work" date="Q4 2021">
        <RoadmapHeader>DAO Enrichment</RoadmapHeader>
        <RoadmapSubHeader>Decentralizing Governance</RoadmapSubHeader>
        <RoadmapDesc>Creation of multi-sig wallet management and further decentralization of governance. Deploy franchise governance for Polly and Pandaswap.</RoadmapDesc>
      </VerticalTimelineElement>
      <VerticalTimelineElement className="vertical-timeline-element--work" date="Q4 2021">
        <RoadmapHeader>Full Synthetics Launch</RoadmapHeader>
        <RoadmapSubHeader>Hard Synthetics Launch on Mainnet</RoadmapSubHeader>
        <RoadmapDesc>
          Hard Synthetics will launch on Ethereum Mainnet in December 2021 ahead of the Bao token unlock.
        </RoadmapDesc>
      </VerticalTimelineElement>
    </VerticalTimeline>
  )
}

export default RoadMap
