const config = {
  networks: {
    polygon: {
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://polygonscan.com/'],
      contracts: {
        GOLD_ADDRESS: '0x68Cd469503384EA977809d898eFae5423C78Dfa2',
        ROCK_ADDRESS: '0xc43D0432c876a8e7b428f0f65E863037BbA564aC',
        SWORD_ADDRESS: '0x0ad67d7DFAADC0df023A2248B67B73ff74521895',
      },
    },
    sepolia: {
      chainId: '0xaa36a7',
      chainName: 'Sepolia Testnet',
      nativeCurrency: {
        name: 'Sepolia ETH',
        symbol: 'SepoliaETH',
        decimals: 18,
      },
      // rpcUrls: ['https://rpc.sepolia.dev'],
      rpcUrls: ['https://rpc.ankr.com/eth_sepolia'],
      blockExplorerUrls: ['https://sepolia.etherscan.io/'],
      contracts: {
        GOLD_ADDRESS: '0x726405e0e37ae5ed87d723b1a234806f612f0da8',
        ROCK_ADDRESS: '0x3803408aAa7848cd401851e7B2BAc1943c6eabC4',
        SWORD_ADDRESS: '0xfAcD99249f2e472d82F8CD658E34fFAE2D92446c',
      },
    },
  },
}

export default config
