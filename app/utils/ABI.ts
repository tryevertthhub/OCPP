const CONTRACT_ABI =  [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "manufacturer",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "model",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "energyCapacity",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "status",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "firmwareVersion",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "softwareVersion",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "connectorType",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "latitude",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "longitude",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "zipCode",
          "type": "string"
        }
      ],
      "name": "addCharger",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "chargerCount",
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
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "chargers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "manufacturer",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "model",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "energyCapacity",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "status",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "firmwareVersion",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "softwareVersion",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "connectorType",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "latitude",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "longitude",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "zipCode",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "transactionHash",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllChargers",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "manufacturer",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "model",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "energyCapacity",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "status",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "firmwareVersion",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "softwareVersion",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "connectorType",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "latitude",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "longitude",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "zipCode",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "transactionHash",
              "type": "string"
            }
          ],
          "internalType": "struct ChargerRegistry.Charger[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "chargerId",
          "type": "uint256"
        }
      ],
      "name": "getCharger",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "manufacturer",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "model",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "energyCapacity",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "status",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "firmwareVersion",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "softwareVersion",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "connectorType",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "latitude",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "longitude",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "zipCode",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "transactionHash",
              "type": "string"
            }
          ],
          "internalType": "struct ChargerRegistry.Charger",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "chargerId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "transactionHash",
          "type": "string"
        }
      ],
      "name": "updateTransactionHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

export default CONTRACT_ABI;
