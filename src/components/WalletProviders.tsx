import { Link } from 'react-router-dom'
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

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      const accounts = await providerWithInfo.provider.request({
        method: 'eth_requestAccounts',
      })

      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header>
      <div className={styles.meta__header}>
        <Link to="/">
          <h2 className={styles.text__white}>MAIN</h2>
        </Link>
        <Link to="/admin">
          <h2 className={styles.text__white}>ADMIN</h2>
        </Link>
      </div>
      <h1 className="swap-title">Swap GOLD</h1>
      <div className={styles.meta__button}>
        {providers.length > 0 ? (
          providers?.map((provider: EIP6963ProviderDetail) => (
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
    </header>
  )
}
