import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { formatAddress } from '~/utils'
import styles from './WalletProviders.module.css'

export const DiscoverWalletProviders = ({
  selectedWallet,
  setSelectedWallet,
  userAccount,
  setUserAccount,
}) => {
  const providers = useSyncProviders()
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = async providerWithInfo => {
    try {
      const accounts = await providerWithInfo.provider.request({
        method: 'eth_requestAccounts',
      })

      const polygonChainId = '0x89'

      const currentChainId = await providerWithInfo.provider.request({
        method: 'eth_chainId',
      })

      if (currentChainId !== polygonChainId) {
        try {
          await providerWithInfo.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: polygonChainId }],
          })
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await providerWithInfo.provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: polygonChainId,
                    chainName: 'Polygon Mainnet',
                    nativeCurrency: {
                      name: 'MATIC',
                      symbol: 'MATIC',
                      decimals: 18,
                    },
                    rpcUrls: ['https://polygon-rpc.com/'],
                    blockExplorerUrls: ['https://polygonscan.com/'],
                  },
                ],
              })
            } catch (addError) {
              console.error(addError)
            }
          } else {
            console.error(switchError)
          }
        }
      }

      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
      setIsConnected(true)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header>
      <div className={styles.meta__header}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          <h2>MAIN</h2>
        </NavLink>
        <NavLink
          to="/market"
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          <h2>MARKET</h2>
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          <h2>ADMIN</h2>
        </NavLink>
      </div>
      <h1 className="swap-title">Swap GOLD</h1>
      <div className={styles.meta__subtitle}>
        <div className={styles.meta__button}>
          {providers.length > 0 ? (
            providers?.map(provider => (
              <button
                key={provider.info.uuid}
                onClick={() => handleConnect(provider)}
              >
                {userAccount ? (
                  <>
                    <img
                      src={selectedWallet.info.icon}
                      alt={selectedWallet.info.name}
                    />
                    <div>({formatAddress(userAccount)})</div>
                  </>
                ) : (
                  <>
                    <img src={provider.info.icon} alt={provider.info.name} />
                    <div>{provider.info.name}</div>
                  </>
                )}
              </button>
            ))
          ) : (
            <div>No Announced Wallet Providers</div>
          )}
        </div>
        {isConnected && (
          <img
            className={styles.meta__icon}
            src="/polygon-matic-logo.svg"
            alt="matic"
          />
        )}
      </div>
    </header>
  )
}
