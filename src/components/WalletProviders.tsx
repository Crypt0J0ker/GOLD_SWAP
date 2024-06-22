import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSyncProviders } from '../hooks/useSyncProviders.js'
import { formatAddress } from '~/utils'
import styles from './WalletProviders.module.css'
import config from './config/config.js'

export const DiscoverWalletProviders = ({
  selectedWallet,
  setSelectedWallet,
  userAccount,
  setUserAccount,
}) => {
  const providers = useSyncProviders()
  const [isConnected, setIsConnected] = useState(false)
  const [chain, setChain] = useState('')

  const handleConnect = async providerWithInfo => {
    try {
      const accounts = await providerWithInfo.provider.request({
        method: 'eth_requestAccounts',
      })

      const { polygon, sepolia } = config.networks

      const currentChainId = await providerWithInfo.provider.request({
        method: 'eth_chainId',
      })

      const switchToChain = async chainConfig => {
        try {
          await providerWithInfo.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainConfig.chainId }],
          })
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await providerWithInfo.provider.request({
                method: 'wallet_addEthereumChain',
                params: [chainConfig],
              })
            } catch (addError) {
              console.error(addError)
            }
          } else {
            console.error(switchError)
          }
        }
      }

      if (
        currentChainId !== polygon.chainId &&
        currentChainId !== sepolia.chainId
      ) {
        await switchToChain(sepolia)
      }

      const chainId = await providerWithInfo.provider.request({
        method: 'eth_chainId',
      })

      setChain(chainId)

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
        {isConnected && chain === '0x89' && (
          <img
            className={styles.meta__icon}
            src="/polygon-matic-logo.svg"
            alt="matic"
          />
        )}

        {isConnected && chain === '0xaa36a7' && (
          <>
            <img
              className={styles.meta__icon_sepolia}
              src="/network_logo_dark.svg"
              alt="sepolia"
            />
          </>
        )}
      </div>
    </header>
  )
}
