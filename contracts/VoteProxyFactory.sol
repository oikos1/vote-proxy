// VoteProxyFactory - create and keep record of proxy identities
pragma solidity ^0.4.18;

import "./VoteProxy.sol";

contract ProxyInterface {
    function hot() public returns (address);
    function cold() public returns (address);
    function self() public returns (address);
}

contract VoteProxyFactory {
    DSChief public chief;
    mapping(address => address) public hotMap;
    mapping(address => address) public coldMap;
    mapping(address => address) public registry;   
    mapping(address => address) public linkRequests;

    event LinkRequested(address indexed cold, address indexed hot);
    event LinkConfirmed(address indexed cold, address indexed hot, address indexed voteProxy);

    constructor(DSChief chief_) public { chief = chief_; }

    function hasProxy(address guy) public view returns (bool) {
        return (address(coldMap[guy]) != address(0x0) || address(hotMap[guy]) != address(0x0));
    }

    function initiateLink(address hot) public {
        require(!hasProxy(msg.sender), "Cold wallet is already linked to another Vote Proxy");
        require(!hasProxy(hot), "Hot wallet is already linked to another Vote Proxy");

        linkRequests[msg.sender] = hot;
        emit LinkRequested(msg.sender, hot);
    }

    function approveLink(address cold, address _proxy) public returns (address voteProxy) {
        require(linkRequests[cold] == msg.sender, "Cold wallet must initiate a link first");
        require(!hasProxy(msg.sender), "Hot wallet is already linked to another Vote Proxy");

        voteProxy = _proxy; //new VoteProxy(chief, cold, msg.sender);
        hotMap[msg.sender] = ProxyInterface(voteProxy).hot();
        coldMap[cold] = ProxyInterface(voteProxy).cold();
        registry[msg.sender] = _proxy;
        
        delete linkRequests[cold];
        emit LinkConfirmed(coldMap[cold], msg.sender, voteProxy);
    }

    function breakLink() public {
        require(hasProxy(msg.sender), "No VoteProxy found for this sender");

        address voteProxy = address(coldMap[msg.sender]) != address(0x0)
            ? coldMap[msg.sender] : hotMap[msg.sender];
        address cold = ProxyInterface(registry[msg.sender]).cold();
        address hot = ProxyInterface(registry[msg.sender]).hot();
        require(chief.deposits(address(voteProxy)) == 0, "VoteProxy still has funds attached to it");

        delete coldMap[cold];
        delete hotMap[hot];
    }

    function linkSelf(address proxy) public returns (address voteProxy) {
        initiateLink(msg.sender);
        return approveLink(msg.sender, proxy);
    }
}
