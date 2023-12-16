// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Hub {
    uint256 constant GRACE_PERIOD = 3 minutes;

    struct Request {
        bool requested;
        uint256 requestedAt;
    }

    mapping (address => Request) public requests;
    mapping (address => bytes) public registeredKeys;

    event PublicKeyRegistered(address indexed user, bytes publicKey);
    event EIMSentToOracle(address indexed owner, bytes encryptedData);
    event EIMRequestedByHeir(address indexed heir);
    event EIMSentToHeir(address indexed heir, bytes encryptedData);

    function registerPubKeyOwner(bytes calldata publicKey) public {
        registeredKeys[msg.sender] = publicKey;
        emit PublicKeyRegistered(msg.sender, publicKey);
    }

    function registerPubKeyHeir(address heir, bytes calldata publicKey) public {
        registeredKeys[heir] = publicKey;
        emit PublicKeyRegistered(heir, publicKey);
    }

    function registerPubKeyOracle(bytes calldata publicKey) public {
        registeredKeys[msg.sender] = publicKey;
        emit PublicKeyRegistered(msg.sender, publicKey);
    }

    function sendEIMtoOracle(bytes calldata encryptedData) public {
        require(registeredKeys[msg.sender].length > 0, "Owner public key not registered");
        emit EIMSentToOracle(msg.sender, encryptedData);
    }

    function requestEIMDiscover() public {
        require(registeredKeys[msg.sender].length > 0, "Heir public key not registered");
        emit EIMRequestedByHeir(msg.sender);
    }

    function sendEIMtoHeir(address heir, bytes calldata encryptedData) public {
        require(registeredKeys[msg.sender].length > 0, "Oracle public key not registered");
        emit EIMSentToHeir(heir, encryptedData);
    }
}
