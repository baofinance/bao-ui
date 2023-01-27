import { ActiveSupportedMarket } from '@/bao/lib/types'

export interface MarketsContext {
	markets: {
		[marketName: string]: {
			comptroller: string
			markets: {
				[marketName: string]: ActiveSupportedMarket[]
			}
		}
	}
}
