import React, { useState, useEffect, useMemo } from 'react'
import './SwapPage.css'
import { ethers } from 'ethers'
import { formatBalance } from '~/utils'

const GOLD_Address = '0x68Cd469503384EA977809d898eFae5423C78Dfa2'
const ROCK_Address = '0x2631c94d2461089DBbaC37253354073586a11D2F'
const SWORD_Address = '0x8de5c8752ae8ee1dd1d461d904fe8383749871cb'

const SwapPage = ({ selectedWallet, userAccount }) => {
  const RPC_URL =
    'https://polygon-mainnet.g.alchemy.com/v2/pmUZRjDjzs7tWIVU8AbhC4EHL7Im-WcO'
  const [fromToken, setFromToken] = useState('ROCK')
  const [balance, setBalance] = useState(0)
  const [goldBalance, setGoldBalance] = useState(0n)
  const [amount, setAmount] = useState(0)
  const [rate, setRate] = useState(0)
  const toToken = 'GOLD'
  const buyTax = 5 // 5% tax

  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), [RPC_URL])

  const GOLD_Contract = useMemo(
    () =>
      new ethers.Contract(
        GOLD_Address,
        [
          'function burnAndMint(address token, uint256 amount)',
          'function whitelistedTokens(address) view returns (uint256, bool)',
        ],
        provider
      ),
    [provider]
  )

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const result = await GOLD_Contract.whitelistedTokens(
          fromToken === 'ROCK' ? ROCK_Address : SWORD_Address
        )
        const rateValue = result[0].toString()
        setRate(rateValue)
      } catch (error) {
        console.error('Error fetching rate:', error)
      }
    }

    fetchRate()
  }, [fromToken])

  useEffect(() => {
    if (!userAccount) return

    const getUserTokenBalance = async () => {
      try {
        const contractAddress =
          fromToken === 'ROCK' ? ROCK_Address : SWORD_Address
        const contract = new ethers.Contract(
          contractAddress,
          ['function balanceOf(address account) view returns (uint256)'],
          provider
        )
        const balance = await contract.balanceOf(userAccount)
        setBalance(Number(balance))
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    const getUserGoldBalance = async () => {
      try {
        const contract = new ethers.Contract(
          GOLD_Address,
          ['function balanceOf(address account) view returns (uint256)'],
          provider
        )
        const balance = await contract.balanceOf(userAccount)
        setGoldBalance(balance)
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    getUserTokenBalance()
    getUserGoldBalance()
  }, [fromToken, userAccount, provider])

  const handleSwap = async () => {
    if (!userAccount || !selectedWallet) return

    try {
      const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
      const signer = await web3Provider.getSigner()
      const count = ethers.parseEther(amount.toString())

      const tokenAddress = fromToken === 'ROCK' ? ROCK_Address : SWORD_Address
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function approve(address spender, uint256 amount) public returns (bool)',
        ],
        signer
      )

      const approveTx = await tokenContract.approve(GOLD_Address, count)
      await approveTx.wait()
      console.log('Approve transaction successful:', approveTx)

      const goldContract = new ethers.Contract(
        GOLD_Address,
        ['function burnAndMint(address token, uint256 amount)'],
        signer
      )
      const tx = await goldContract.burnAndMint(tokenAddress, count)
      await tx.wait()
      const getUserTokenBalance = async () => {
        try {
          const contractAddress =
            fromToken === 'ROCK' ? ROCK_Address : SWORD_Address
          const contract = new ethers.Contract(
            contractAddress,
            ['function balanceOf(address account) view returns (uint256)'],
            provider
          )
          const balance = await contract.balanceOf(userAccount)
          setBalance(Number(balance))
        } catch (error) {
          console.error('Error fetching balance:', error)
        }
      }

      const getUserGoldBalance = async () => {
        try {
          const contract = new ethers.Contract(
            GOLD_Address,
            ['function balanceOf(address account) view returns (uint256)'],
            provider
          )
          const balance = await contract.balanceOf(userAccount)
          setGoldBalance(balance)
        } catch (error) {
          console.error('Error fetching balance:', error)
        }
      }

      getUserTokenBalance()
      getUserGoldBalance()
      console.log('Transaction successful:', tx)
    } catch (error) {
      console.error('Error swapping tokens:', error)
    }
  }

  const handleFromTokenChange = event => {
    setFromToken(event.target.value)
  }

  const handleAmountChange = event => {
    const newValue = parseFloat(event.target.value)

    if (newValue >= 0) {
      const balanceInTokens = parseFloat(
        (balance / 1000000000000000000).toString()
      )

      if (newValue <= balanceInTokens) {
        setAmount(newValue)
      } else {
        setAmount(balanceInTokens)
      }
    } else {
      setAmount(0)
    }
  }

  const calculateConvertedAmount = amount => {
    return (amount * rate * (100 - buyTax)) / 100000
  }

  return (
    <div className="swap-container">
      <p className="swap-note">Note: 5% will be deducted as a buy tax.</p>
      <div className="swap-box">
        <div className="swap-section">
          <label htmlFor="from-token">From:</label>
          <select
            id="from-token"
            value={fromToken}
            onChange={handleFromTokenChange}
          >
            <option value="ROCK">ROCK</option>
            <option value="SWORD">SWORD</option>
          </select>
        </div>
        <p className="balance-text">
          Balance: {formatBalance(balance.toString())}
        </p>
        <div className="swap-section">
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
        <div className="swap-section">
          <label htmlFor="to-token">To:</label>
          <input id="to-token" type="text" value={toToken} readOnly />
        </div>
        <div className="swap-section">
          <label htmlFor="to-amount">Converted Amount:</label>
          <input
            id="to-amount"
            type="number"
            value={calculateConvertedAmount(amount)}
            readOnly
          />
        </div>
        <p className="balance-text-gold">
          GOLD balance: {ethers.formatEther(goldBalance)}
        </p>
        <button className="swap-button" onClick={handleSwap}>
          Swap
        </button>
      </div>
      <p>GOLD address: {GOLD_Address}</p>
      <p>ROCK address: {ROCK_Address}</p>
      <p>SWORD address: {SWORD_Address}</p>
    </div>
  )
}

export default SwapPage
