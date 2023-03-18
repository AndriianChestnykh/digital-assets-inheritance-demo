// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Hub {
    uint256 constant GRACE_PERIOD = 3 minutes;

    struct Request {
        bool requested;
        uint256 requestedAt;
    }

    // todo Should be more than one inheritance process per heir
    mapping (address => Request) public requests;

    event MessageRequestedToPublish(address indexed heir);
    event MessageDemandNotToPublish(address indexed heir, address indexed requester);
    event MessagePublished(address indexed heir, string message);

    function requestToPublish() public {
        requests[msg.sender].requested = true;
        requests[msg.sender].requestedAt = block.timestamp;
        emit MessageRequestedToPublish(msg.sender);
    }

    // anyone can demand not to publish, the contract does not know the owner
    // it is up to publisher to decide whether to publish or not
    function demandNotToPublish(address heir) public {
        emit MessageDemandNotToPublish(heir, msg.sender);
    }

    function publish(address heir, string calldata message) public {
//        require(requests[heir].requested, "The heir has not requested to publish.");
//        require(block.timestamp >= requests[heir].requestedAt + GRACE_PERIOD, "The grace period has not ended yet.");
//        delete requests[heir];
        emit MessagePublished(heir, message);
    }
}
