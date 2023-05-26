[
    {
        "inputs": [
            {
                "internalType": "address[3]",
                "name": "uwl",
                "type": "address[3]"
            },
            {
                "internalType": "uint8",
                "name": "d",
                "type": "uint8"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_coin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_e_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_lpt_coin_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_lpt_tt_coin_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_tt_b",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_f",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_lpt_tt_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_tt_b",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_lpt_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_t_coin_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_t_tt_coin_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_f",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_t_tt_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_bankOf_t_usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "_e_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_coin_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_t_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_t_coin_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_t_tt_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_t_tt_coin_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_lpt_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_lpt_coin_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_lpt_tt_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_lpt_tt_coin_usd",
                "type": "uint256[]"
            }
        ],
        "name": "_puBankOf_pool2_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "_e_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_coin_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_t_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_t_coin_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_t_tt_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_t_tt_coin_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_lpt_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_lpt_coin_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_lpt_tt_usd",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_lpt_tt_coin_usd",
                "type": "uint256[]"
            }
        ],
        "name": "_puBankOf_staking_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_coin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_e_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_lpt_coin_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_lpt_tt_coin_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_lpt_tt_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_lpt_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_t_coin_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_t_tt_coin_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_t_tt_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_pullBankOf_t_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_coin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_e_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_lpt_coin_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_tt_b",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_f",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_lpt_tt_coin_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_tt_b",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_lpt_tt_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_lpt_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_t_coin_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_f",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_t_tt_coin_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_t_tt_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "dec",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "_pushBankOf_t_usd",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_e_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_lpt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_lpt_tt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_lpt_tt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_lpt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvlOf_pool2_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvlOf_staking_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_t_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_t_tt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_t_tt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "_tvlOf_t_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_e_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_lpt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_lpt_tt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_lpt_tt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_lpt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_pool2_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_staking_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_t_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_t_tt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_t_tt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_tvl_t_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "coinusd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "p_lpt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "bt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_f",
                "type": "address"
            }
        ],
        "name": "p_lpt_tt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "bt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            }
        ],
        "name": "p_lpt_tt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "p_lpt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "p_t_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "qt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_f",
                "type": "address"
            }
        ],
        "name": "p_t_tt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "qt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_tt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp_bt_u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            }
        ],
        "name": "p_t_tt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "p_t_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pool2",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokens",
                "type": "uint256"
            }
        ],
        "name": "rescue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "reset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[3]",
                "name": "uwl",
                "type": "address[3]"
            },
            {
                "internalType": "uint8",
                "name": "d",
                "type": "uint8"
            }
        ],
        "name": "setUWLD",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "staking",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tvl",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "q",
                "type": "address"
            }
        ],
        "name": "tvlOf_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "q",
                "type": "address"
            }
        ],
        "name": "tvlOf_e_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "pool",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "dec",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "lp",
                        "type": "address"
                    }
                ],
                "internalType": "struct EquilibreTvlOracle.lpt_coin_usd",
                "name": "q",
                "type": "tuple"
            }
        ],
        "name": "tvlOf_lpt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "pool",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "dec",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_tt",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_tt_b",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_bt_f",
                        "type": "address"
                    }
                ],
                "internalType": "struct EquilibreTvlOracle.lpt_tt_coin_usd",
                "name": "q",
                "type": "tuple"
            }
        ],
        "name": "tvlOf_lpt_tt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "pool",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "dec",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_tt",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_tt_b",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_bt_u",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "u",
                        "type": "address"
                    }
                ],
                "internalType": "struct EquilibreTvlOracle.lpt_tt_usd",
                "name": "q",
                "type": "tuple"
            }
        ],
        "name": "tvlOf_lpt_tt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "pool",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "dec",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "u",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "lp",
                        "type": "address"
                    }
                ],
                "internalType": "struct EquilibreTvlOracle.lpt_usd",
                "name": "q",
                "type": "tuple"
            }
        ],
        "name": "tvlOf_lpt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "pool",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "dec",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "lp",
                        "type": "address"
                    }
                ],
                "internalType": "struct EquilibreTvlOracle.t_coin_usd",
                "name": "q",
                "type": "tuple"
            }
        ],
        "name": "tvlOf_t_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "pool",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "dec",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_tt",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_bt_f",
                        "type": "address"
                    }
                ],
                "internalType": "struct EquilibreTvlOracle.t_tt_coin_usd",
                "name": "q",
                "type": "tuple"
            }
        ],
        "name": "tvlOf_t_tt_coin_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "pool",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "dec",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_tt",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "lp_bt_u",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "u",
                        "type": "address"
                    }
                ],
                "internalType": "struct EquilibreTvlOracle.t_tt_usd",
                "name": "q",
                "type": "tuple"
            }
        ],
        "name": "tvlOf_t_tt_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "pool",
                        "type": "address"
                    },
                    {
                        "internalType": "uint8",
                        "name": "dec",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "u",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "lp",
                        "type": "address"
                    }
                ],
                "internalType": "struct EquilibreTvlOracle.t_usd",
                "name": "q",
                "type": "tuple"
            }
        ],
        "name": "tvlOf_t_usd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usd",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usd_d",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wcoin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wcoinusd",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
