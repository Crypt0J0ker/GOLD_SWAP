import React, { useState } from 'react'
import { DiscoverWalletProviders } from './components/WalletProviders'
import SwapPage from './components/SwapPage'
import AdminPage from './components/AdminPage'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MarketPage from './components/MarketPage'

function App() {
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [userAccount, setUserAccount] = useState('')

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
              <MarketPage
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
