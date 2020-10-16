const config = {
  infuraProvider: "http://127.0.0.1:9545/",
  lfOriginalsContract: "0x18a704cE592CC6E1609f253715DA629F517d0850",

  //infuraProvider: "http://127.0.0.1:9545/",
  //infuraProvider: "https://rinkeby.infura.io/v3/da08cbb0e0604f3ab2f57742f776c115",

  //lfOriginalsContractGanache: "0x18a704cE592CC6E1609f253715DA629F517d0850",

  //lfOriginalsContractKovan: "0x85f8CDf1A693cDa94C0297c2c64eE54e713A4598",

  //lfOriginalsContractRinkeby: "0xa91F7Cbd319a294E38e6Cb912BE6163b33898d2C",
  //lfOriginalsContractRinkebyv2: "0x0c78941edA624511DAF3C05b082cb19c0e6c7C0d",

  LFOriginalsABI: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "approved",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "ApprovalForAll",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_artistAccount",
          type: "address",
        },
      ],
      name: "EditionCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_buyer",
          type: "address",
        },
      ],
      name: "Minted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Paused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_buyer",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
      ],
      name: "Purchase",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "previousAdminRole",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newAdminRole",
          type: "bytes32",
        },
      ],
      name: "RoleAdminChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "RoleGranted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "RoleRevoked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Unpaused",
      type: "event",
    },
    {
      inputs: [],
      name: "ADMIN_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "DEFAULT_ADMIN_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "LF_MEMBER",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MINTER_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "artistCommission",
      outputs: [
        {
          internalType: "address",
          name: "_artistAccount",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_artistCommission",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_artistsAccount",
          type: "address",
        },
      ],
      name: "artistsEditions",
      outputs: [
        {
          internalType: "uint256[]",
          name: "_editionNumbers",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "baseURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
      ],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "address payable",
          name: "_artistAccount",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_artistCommission",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_tokenURI",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_maxAvailable",
          type: "uint256",
        },
      ],
      name: "createActiveEdition",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "address payable",
          name: "_artistAccount",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_artistCommission",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_tokenURI",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_totalSupply",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_totalAvailable",
          type: "uint256",
        },
      ],
      name: "createActivePreMintedEdition",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "address payable",
          name: "_artistAccount",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_artistCommission",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_tokenURI",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_totalAvailable",
          type: "uint256",
        },
      ],
      name: "createInactiveEdition",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "address payable",
          name: "_artistAccount",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_artistCommission",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_tokenURI",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_totalSupply",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_totalAvailable",
          type: "uint256",
        },
      ],
      name: "createInactivePreMintedEdition",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "editionNumber",
          type: "uint256",
        },
      ],
      name: "detailsOfEdition",
      outputs: [
        {
          internalType: "address payable",
          name: "_artistAccount",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_artistCommission",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_tokenURI",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_circulatingSupply",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_maxAvailable",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "_active",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "edition",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "editionExists",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "editionNumberToDetails",
      outputs: [
        {
          internalType: "uint256",
          name: "editionNumber",
          type: "uint256",
        },
        {
          internalType: "address payable",
          name: "artistAccount",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "artistCommission",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "priceInWei",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "tokenURI",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "totalSupply",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalAvailable",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "active",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
      ],
      name: "editionOfTokenId",
      outputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getApproved",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
      ],
      name: "getRoleAdmin",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "getRoleMember",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
      ],
      name: "getRoleMemberCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "grantRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "hasRole",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
      ],
      name: "isApprovedForAll",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "lfCommissionAccount",
      outputs: [
        {
          internalType: "address payable",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "mint",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "paused",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "priceInWeiEdition",
      outputs: [
        {
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
      ],
      name: "priceInWeiToken",
      outputs: [
        {
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "purchase",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "purchaseTo",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "renounceRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "revokeRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "_data",
          type: "bytes",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "setApprovalForAll",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_uri",
          type: "string",
        },
      ],
      name: "setTokenURI",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4",
        },
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "tokenByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
      ],
      name: "tokenData",
      outputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_tokenURI",
          type: "string",
        },
        {
          internalType: "address",
          name: "_owner",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "tokenOfOwnerByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "tokensOfEdition",
      outputs: [
        {
          internalType: "uint256[]",
          name: "_tokenIds",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalItemsAvailable",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalNumberMinted",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalPurchaseValueInWei",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "totalRemaining",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
      ],
      name: "underMint",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "_active",
          type: "bool",
        },
      ],
      name: "updateActive",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_rate",
          type: "uint256",
        },
      ],
      name: "updateArtistCommission",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "address payable",
          name: "_artistAccount",
          type: "address",
        },
      ],
      name: "updateArtistsAccount",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_uri",
          type: "string",
        },
      ],
      name: "updateEditionTokenURI",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address payable",
          name: "_lfCommissionAccount",
          type: "address",
        },
      ],
      name: "updateLFCommissionAccount",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_priceInWei",
          type: "uint256",
        },
      ],
      name: "updatePriceInWei",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_totalAvailable",
          type: "uint256",
        },
      ],
      name: "updateTotalAvailable",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_editionNumber",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_totalSupply",
          type: "uint256",
        },
      ],
      name: "updateTotalSupply",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};

export default config;
