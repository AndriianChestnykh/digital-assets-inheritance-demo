// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Wallet {
    uint256 private constant CHAIN_ID = 31337; // for Hardhat local test net. Change it to suit your network.

    string private constant EIP712_DOMAIN =
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
    string private constant INHERITANCE_MESSAGE_TYPE =
        "InheritanceMessage(address heirAddress)";

    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(abi.encodePacked(EIP712_DOMAIN));
    bytes32 private constant INHERITANCE_MESSAGE_TYPEHASH =
        keccak256(abi.encodePacked(INHERITANCE_MESSAGE_TYPE));

    bytes32 private domainSeparator =
        keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256("InheritanceMessage"), // string name
                keccak256("1"), // string version
                CHAIN_ID, // uint256 chainId
                address(this) // address verifyingContract
            )
        );

    address payable public controller;
    uint256 public gracePeriodBlocks;
    address public pendingController;
    uint256 public pendingControllerCommitBlock;

    struct InheritanceMessage {
        address heirAddress;
    }

    event ControllerTransferInitiated(address indexed newController);
    event ControllerTransferFinalized(address indexed newController);
    event ControllerTransferCancelled(address indexed newController);

    constructor(address controler, uint256 _gracePeriodBlocks) payable {
        controller = payable(controler);
        gracePeriodBlocks = _gracePeriodBlocks;
    }

    function changeControllerInstantly(address newController) public {
        controller = payable(newController);
    }

    function initControllerChange(
        address newController,
        InheritanceMessage memory im,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) public {
        require(
            msg.sender == im.heirAddress,
            "Only the heir can initiate a controller change"
        );
        require(
            ecrecover(_hashInheritanceMessage(im), sigV, sigR, sigS) ==
                controller,
            "The inheritance message is not signed by the controller"
        );

        pendingController = newController;
        pendingControllerCommitBlock = block.number;

        emit ControllerTransferInitiated(newController);
    }

    function finalizeControllerChange() public {
        require(
            pendingController != address(0),
            "No pending controller is waiting"
        );
        require(
            block.number >= pendingControllerCommitBlock + gracePeriodBlocks,
            "Grace period has not passed yet"
        );
        controller = payable(pendingController);

        emit ControllerTransferFinalized(pendingController);
        pendingController = address(0);
        pendingControllerCommitBlock = 0;
    }

    function cancelControllerChange() public {
        emit ControllerTransferCancelled(pendingController);
        pendingController = address(0);
        pendingControllerCommitBlock = 0;
    }

    function send(address payable to, uint256 amount) public {
        require(msg.sender == controller, "Controller check failed");
        to.transfer(amount);
    }

    receive() external payable {}

    fallback(bytes calldata input) external returns (bytes memory output) {
        require(msg.sender == controller, "Controller check failed");

        (address targetContract) = abi.decode(input[4:36], (address));
        bytes memory _data = abi.encodePacked(msg.sig, input[36:]);

        (bool success, bytes memory returnData) = targetContract.call(_data);

        require(success, "Contract call failed");
        return returnData;
    }

    function _hashInheritanceMessage(
        InheritanceMessage memory _msg
    ) private view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    domainSeparator,
                    keccak256(
                        abi.encode(
                            INHERITANCE_MESSAGE_TYPEHASH,
                            _msg.heirAddress
                        )
                    )
                )
            );
    }
}
