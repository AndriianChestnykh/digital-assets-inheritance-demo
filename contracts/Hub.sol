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

    mapping (address => bool) public isHeir;

    event PublicKeyRegistered(address indexed user, bytes publicKey);
    event EIMSentToOracle(address indexed owner, address indexed heir, bytes encryptedData);
    event EIMRequestedByHeir(address indexed heir);
    event EIMSentToHeir(address indexed heir, bytes encryptedData);

    function registerPubKeyOwner(bytes calldata publicKey) public {
        // TODO apply the check, convert to modifier

        //        // Check that the public key is of the correct length (64 bytes for uncompressed Ethereum public keys)
        //        require(publicKey.length == 64, "Invalid public key length");
        //
        //        // Compute the address by taking the last 20 bytes of the keccak256 hash of the public key
        //        bytes32 hash = keccak256(publicKey);
        //        require(msg.sender = address(uint160(uint256(hash)));

        registeredKeys[msg.sender] = publicKey;
        emit PublicKeyRegistered(msg.sender, publicKey);
    }

    function registerPubKeyHeir(address heir, bytes calldata publicKey) public {
        registeredKeys[heir] = publicKey;
        isHeir[msg.sender] = true;
        emit PublicKeyRegistered(heir, publicKey);
    }

    function registerPubKeyOracle(bytes calldata publicKey) public {
        registeredKeys[msg.sender] = publicKey;
        emit PublicKeyRegistered(msg.sender, publicKey);
    }

    function sendEIMtoOracle(address heirAddress, bytes calldata encryptedData) public {
        require(registeredKeys[msg.sender].length > 0, "Owner public key not registered");
        emit EIMSentToOracle(msg.sender, heirAddress, encryptedData);
    }

    function requestEIMDiscover() public {
        require(registeredKeys[msg.sender].length > 0, "Heir public key not registered");
        emit EIMRequestedByHeir(msg.sender);
    }

    function sendEIMtoHeir(address heir, bytes calldata encryptedData) public {
        require(registeredKeys[msg.sender].length > 0, "Oracle public key not registered");
        emit EIMSentToHeir(heir, encryptedData);
    }

    function getPublicKeyHeir(string memory heirAddressStr) public view returns (bytes memory) {
        address heirAddress = address(bytes20(bytes(heirAddressStr)));
        require(isHeir[heirAddress], "Addres is not Heir");
        return registeredKeys[heirAddress];
    }
}
