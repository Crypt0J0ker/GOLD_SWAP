import './App.css'
import { DiscoverWalletProviders } from './components/WalletProviders'
import SwapPage from './components/SwapPage'
import { useState } from 'react'

function App() {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')

  return (
    <div className="App">
      <DiscoverWalletProviders
        selectedWallet={selectedWallet}
        setSelectedWallet={setSelectedWallet}
        userAccount={userAccount}
        setUserAccount={setUserAccount}
      />
      <SwapPage selectedWallet={selectedWallet} userAccount={userAccount} />
    </div>
  )
}

export default App
