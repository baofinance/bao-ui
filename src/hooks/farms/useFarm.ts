import { Context as FarmsContext, Farm } from 'contexts/Farms'
import { useContext } from 'react'

const useFarm = (id: string): Farm => {
	const { farms } = useContext(FarmsContext)
	return farms.find(farm => farm.id === id)
}

export default useFarm
