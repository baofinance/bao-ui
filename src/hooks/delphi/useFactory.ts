import { useEffect, useState } from 'react'
import GraphUtil from '../../utils/graph'
import { OracleFactory } from '../../views/Delphi/types'

const useFactory = () => {
  const [factory, setFactory] = useState<OracleFactory | undefined>()

  useEffect(() => {
    GraphUtil.getDelphiFactoryInfo().then((res) => {
      setFactory(res)
    })
  }, [])

  return factory as OracleFactory
}

export default useFactory
