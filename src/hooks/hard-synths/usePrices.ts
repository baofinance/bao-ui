import React, { useEffect, useState } from "react"
import styled from "styled-components"
import Config from '../../bao/lib/config'



interface Prices {
  prices: {
    [key: string]: {
      usd: number
    }
  }
}

export const usePrice = (): Prices => {
    const [price, setPrice] = useState()
    const coingeckoId = Config.markets.map((market) => market.coingeckoId[Config.networkId])


        const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`

        const fetchData = async () => {
            try {
              const response = await fetch(url)
              const price = await response.json()
              console.log(price)
              setPrice(price)
            } catch (error) {
              console.log("error", error)
            }
          }
      
          fetchData()
          return {
            prices: price
        }
      }
    