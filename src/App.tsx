import React, { useEffect, useState } from 'react'
import { DiscoverWalletProviders } from './components/WalletProviders'
import SwapPage from './components/SwapPage'
import AdminPage from './components/AdminPage'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MarketPage from './components/MarketPage'
import MarketPageSep from './components/MarketPage_sep'

import config from './components/config/config.js'

interface Network {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
  contracts: {
    ROCK_ADDRESS: string
    GOLD_ADDRESS: string
    SWORD_ADDRESS: string
  }
}

function App() {
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [userAccount, setUserAccount] = useState('')
  const [networkConfig, setNetworkConfig] = useState(null)

  const getNetworkConfig = selectedWallet => {
    if (!selectedWallet || !selectedWallet.info || !selectedWallet.provider)
      return null

    let chainId
    try {
      chainId =
        selectedWallet.provider.chainId ||
        selectedWallet.provider._network.chainId
      console.log('chainId', chainId)
    } catch (error) {
      console.error('Error retrieving chainId:', error)
      return null
    }

    const network: Network | undefined = (
      Object.values(config.networks) as Network[]
    ).find(network => network.chainId === chainId)

    return network ? network : null
  }

  useEffect(() => {
    const networkConfig = getNetworkConfig(selectedWallet)
    setNetworkConfig(networkConfig)
  }, [selectedWallet])

  const MarketComponent =
    networkConfig?.chainName === 'Polygon Mainnet' ? MarketPage : MarketPageSep

  return (
    <Router>
      <div className="App">
        <DiscoverWalletProviders
          selectedWallet={selectedWallet}
          setSelectedWallet={setSelectedWallet}
          userAccount={userAccount}
          setUserAccount={setUserAccount}
        />
        <Routes>
          <Route
            path="/"
            element={
              <SwapPage
                selectedWallet={selectedWallet}
                userAccount={userAccount}
              />
            }
          />
          <Route
            path="/market"
            element={
              <MarketComponent
                selectedWallet={selectedWallet}
                userAccount={userAccount}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminPage
                selectedWallet={selectedWallet}
                userAccount={userAccount}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
