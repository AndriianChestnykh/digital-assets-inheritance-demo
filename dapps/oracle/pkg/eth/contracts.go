// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package eth

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// HubMetaData contains all meta data concerning the Hub contract.
var HubMetaData = &bind.MetaData{
	ABI: "[{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"heir\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"requester\",\"type\":\"address\"}],\"name\":\"MessageDemandNotToPublish\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"heir\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"message\",\"type\":\"string\"}],\"name\":\"MessagePublished\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"heir\",\"type\":\"address\"}],\"name\":\"MessageRequestedToPublish\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"heir\",\"type\":\"address\"}],\"name\":\"demandNotToPublish\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"heir\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"message\",\"type\":\"string\"}],\"name\":\"publish\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"requestToPublish\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"requests\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"requested\",\"type\":\"bool\"},{\"internalType\":\"uint256\",\"name\":\"requestedAt\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// HubABI is the input ABI used to generate the binding from.
// Deprecated: Use HubMetaData.ABI instead.
var HubABI = HubMetaData.ABI

// Hub is an auto generated Go binding around an Ethereum contract.
type Hub struct {
	HubCaller     // Read-only binding to the contract
	HubTransactor // Write-only binding to the contract
	HubFilterer   // Log filterer for contract events
}

// HubCaller is an auto generated read-only Go binding around an Ethereum contract.
type HubCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HubTransactor is an auto generated write-only Go binding around an Ethereum contract.
type HubTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HubFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type HubFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HubSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type HubSession struct {
	Contract     *Hub              // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// HubCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type HubCallerSession struct {
	Contract *HubCaller    // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// HubTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type HubTransactorSession struct {
	Contract     *HubTransactor    // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// HubRaw is an auto generated low-level Go binding around an Ethereum contract.
type HubRaw struct {
	Contract *Hub // Generic contract binding to access the raw methods on
}

// HubCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type HubCallerRaw struct {
	Contract *HubCaller // Generic read-only contract binding to access the raw methods on
}

// HubTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type HubTransactorRaw struct {
	Contract *HubTransactor // Generic write-only contract binding to access the raw methods on
}

// NewHub creates a new instance of Hub, bound to a specific deployed contract.
func NewHub(address common.Address, backend bind.ContractBackend) (*Hub, error) {
	contract, err := bindHub(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Hub{HubCaller: HubCaller{contract: contract}, HubTransactor: HubTransactor{contract: contract}, HubFilterer: HubFilterer{contract: contract}}, nil
}

// NewHubCaller creates a new read-only instance of Hub, bound to a specific deployed contract.
func NewHubCaller(address common.Address, caller bind.ContractCaller) (*HubCaller, error) {
	contract, err := bindHub(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &HubCaller{contract: contract}, nil
}

// NewHubTransactor creates a new write-only instance of Hub, bound to a specific deployed contract.
func NewHubTransactor(address common.Address, transactor bind.ContractTransactor) (*HubTransactor, error) {
	contract, err := bindHub(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &HubTransactor{contract: contract}, nil
}

// NewHubFilterer creates a new log filterer instance of Hub, bound to a specific deployed contract.
func NewHubFilterer(address common.Address, filterer bind.ContractFilterer) (*HubFilterer, error) {
	contract, err := bindHub(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &HubFilterer{contract: contract}, nil
}

// bindHub binds a generic wrapper to an already deployed contract.
func bindHub(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(HubABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Hub *HubRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Hub.Contract.HubCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Hub *HubRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Hub.Contract.HubTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Hub *HubRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Hub.Contract.HubTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Hub *HubCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Hub.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Hub *HubTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Hub.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Hub *HubTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Hub.Contract.contract.Transact(opts, method, params...)
}

// Requests is a free data retrieval call binding the contract method 0x74adad1d.
//
// Solidity: function requests(address ) view returns(bool requested, uint256 requestedAt)
func (_Hub *HubCaller) Requests(opts *bind.CallOpts, arg0 common.Address) (struct {
	Requested   bool
	RequestedAt *big.Int
}, error) {
	var out []interface{}
	err := _Hub.contract.Call(opts, &out, "requests", arg0)

	outstruct := new(struct {
		Requested   bool
		RequestedAt *big.Int
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Requested = *abi.ConvertType(out[0], new(bool)).(*bool)
	outstruct.RequestedAt = *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)

	return *outstruct, err

}

// Requests is a free data retrieval call binding the contract method 0x74adad1d.
//
// Solidity: function requests(address ) view returns(bool requested, uint256 requestedAt)
func (_Hub *HubSession) Requests(arg0 common.Address) (struct {
	Requested   bool
	RequestedAt *big.Int
}, error) {
	return _Hub.Contract.Requests(&_Hub.CallOpts, arg0)
}

// Requests is a free data retrieval call binding the contract method 0x74adad1d.
//
// Solidity: function requests(address ) view returns(bool requested, uint256 requestedAt)
func (_Hub *HubCallerSession) Requests(arg0 common.Address) (struct {
	Requested   bool
	RequestedAt *big.Int
}, error) {
	return _Hub.Contract.Requests(&_Hub.CallOpts, arg0)
}

// DemandNotToPublish is a paid mutator transaction binding the contract method 0x77b43a0c.
//
// Solidity: function demandNotToPublish(address heir) returns()
func (_Hub *HubTransactor) DemandNotToPublish(opts *bind.TransactOpts, heir common.Address) (*types.Transaction, error) {
	return _Hub.contract.Transact(opts, "demandNotToPublish", heir)
}

// DemandNotToPublish is a paid mutator transaction binding the contract method 0x77b43a0c.
//
// Solidity: function demandNotToPublish(address heir) returns()
func (_Hub *HubSession) DemandNotToPublish(heir common.Address) (*types.Transaction, error) {
	return _Hub.Contract.DemandNotToPublish(&_Hub.TransactOpts, heir)
}

// DemandNotToPublish is a paid mutator transaction binding the contract method 0x77b43a0c.
//
// Solidity: function demandNotToPublish(address heir) returns()
func (_Hub *HubTransactorSession) DemandNotToPublish(heir common.Address) (*types.Transaction, error) {
	return _Hub.Contract.DemandNotToPublish(&_Hub.TransactOpts, heir)
}

// Publish is a paid mutator transaction binding the contract method 0xba68a2bf.
//
// Solidity: function publish(address heir, string message) returns()
func (_Hub *HubTransactor) Publish(opts *bind.TransactOpts, heir common.Address, message string) (*types.Transaction, error) {
	return _Hub.contract.Transact(opts, "publish", heir, message)
}

// Publish is a paid mutator transaction binding the contract method 0xba68a2bf.
//
// Solidity: function publish(address heir, string message) returns()
func (_Hub *HubSession) Publish(heir common.Address, message string) (*types.Transaction, error) {
	return _Hub.Contract.Publish(&_Hub.TransactOpts, heir, message)
}

// Publish is a paid mutator transaction binding the contract method 0xba68a2bf.
//
// Solidity: function publish(address heir, string message) returns()
func (_Hub *HubTransactorSession) Publish(heir common.Address, message string) (*types.Transaction, error) {
	return _Hub.Contract.Publish(&_Hub.TransactOpts, heir, message)
}

// RequestToPublish is a paid mutator transaction binding the contract method 0x2bf8b63a.
//
// Solidity: function requestToPublish() returns()
func (_Hub *HubTransactor) RequestToPublish(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Hub.contract.Transact(opts, "requestToPublish")
}

// RequestToPublish is a paid mutator transaction binding the contract method 0x2bf8b63a.
//
// Solidity: function requestToPublish() returns()
func (_Hub *HubSession) RequestToPublish() (*types.Transaction, error) {
	return _Hub.Contract.RequestToPublish(&_Hub.TransactOpts)
}

// RequestToPublish is a paid mutator transaction binding the contract method 0x2bf8b63a.
//
// Solidity: function requestToPublish() returns()
func (_Hub *HubTransactorSession) RequestToPublish() (*types.Transaction, error) {
	return _Hub.Contract.RequestToPublish(&_Hub.TransactOpts)
}

// HubMessageDemandNotToPublishIterator is returned from FilterMessageDemandNotToPublish and is used to iterate over the raw logs and unpacked data for MessageDemandNotToPublish events raised by the Hub contract.
type HubMessageDemandNotToPublishIterator struct {
	Event *HubMessageDemandNotToPublish // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *HubMessageDemandNotToPublishIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(HubMessageDemandNotToPublish)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(HubMessageDemandNotToPublish)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *HubMessageDemandNotToPublishIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *HubMessageDemandNotToPublishIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// HubMessageDemandNotToPublish represents a MessageDemandNotToPublish event raised by the Hub contract.
type HubMessageDemandNotToPublish struct {
	Heir      common.Address
	Requester common.Address
	Raw       types.Log // Blockchain specific contextual infos
}

// FilterMessageDemandNotToPublish is a free log retrieval operation binding the contract event 0x581e596c765756a3cbf2f10b81681efafcbd8b6fcaf8f24d0277f1c9f3017808.
//
// Solidity: event MessageDemandNotToPublish(address indexed heir, address indexed requester)
func (_Hub *HubFilterer) FilterMessageDemandNotToPublish(opts *bind.FilterOpts, heir []common.Address, requester []common.Address) (*HubMessageDemandNotToPublishIterator, error) {

	var heirRule []interface{}
	for _, heirItem := range heir {
		heirRule = append(heirRule, heirItem)
	}
	var requesterRule []interface{}
	for _, requesterItem := range requester {
		requesterRule = append(requesterRule, requesterItem)
	}

	logs, sub, err := _Hub.contract.FilterLogs(opts, "MessageDemandNotToPublish", heirRule, requesterRule)
	if err != nil {
		return nil, err
	}
	return &HubMessageDemandNotToPublishIterator{contract: _Hub.contract, event: "MessageDemandNotToPublish", logs: logs, sub: sub}, nil
}

// WatchMessageDemandNotToPublish is a free log subscription operation binding the contract event 0x581e596c765756a3cbf2f10b81681efafcbd8b6fcaf8f24d0277f1c9f3017808.
//
// Solidity: event MessageDemandNotToPublish(address indexed heir, address indexed requester)
func (_Hub *HubFilterer) WatchMessageDemandNotToPublish(opts *bind.WatchOpts, sink chan<- *HubMessageDemandNotToPublish, heir []common.Address, requester []common.Address) (event.Subscription, error) {

	var heirRule []interface{}
	for _, heirItem := range heir {
		heirRule = append(heirRule, heirItem)
	}
	var requesterRule []interface{}
	for _, requesterItem := range requester {
		requesterRule = append(requesterRule, requesterItem)
	}

	logs, sub, err := _Hub.contract.WatchLogs(opts, "MessageDemandNotToPublish", heirRule, requesterRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HubMessageDemandNotToPublish)
				if err := _Hub.contract.UnpackLog(event, "MessageDemandNotToPublish", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseMessageDemandNotToPublish is a log parse operation binding the contract event 0x581e596c765756a3cbf2f10b81681efafcbd8b6fcaf8f24d0277f1c9f3017808.
//
// Solidity: event MessageDemandNotToPublish(address indexed heir, address indexed requester)
func (_Hub *HubFilterer) ParseMessageDemandNotToPublish(log types.Log) (*HubMessageDemandNotToPublish, error) {
	event := new(HubMessageDemandNotToPublish)
	if err := _Hub.contract.UnpackLog(event, "MessageDemandNotToPublish", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// HubMessagePublishedIterator is returned from FilterMessagePublished and is used to iterate over the raw logs and unpacked data for MessagePublished events raised by the Hub contract.
type HubMessagePublishedIterator struct {
	Event *HubMessagePublished // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *HubMessagePublishedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(HubMessagePublished)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(HubMessagePublished)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *HubMessagePublishedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *HubMessagePublishedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// HubMessagePublished represents a MessagePublished event raised by the Hub contract.
type HubMessagePublished struct {
	Heir    common.Address
	Message string
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterMessagePublished is a free log retrieval operation binding the contract event 0x296f958024e31feaffa788f1f930bb472244f0307f637acb867fb63e3b2af2e0.
//
// Solidity: event MessagePublished(address indexed heir, string message)
func (_Hub *HubFilterer) FilterMessagePublished(opts *bind.FilterOpts, heir []common.Address) (*HubMessagePublishedIterator, error) {

	var heirRule []interface{}
	for _, heirItem := range heir {
		heirRule = append(heirRule, heirItem)
	}

	logs, sub, err := _Hub.contract.FilterLogs(opts, "MessagePublished", heirRule)
	if err != nil {
		return nil, err
	}
	return &HubMessagePublishedIterator{contract: _Hub.contract, event: "MessagePublished", logs: logs, sub: sub}, nil
}

// WatchMessagePublished is a free log subscription operation binding the contract event 0x296f958024e31feaffa788f1f930bb472244f0307f637acb867fb63e3b2af2e0.
//
// Solidity: event MessagePublished(address indexed heir, string message)
func (_Hub *HubFilterer) WatchMessagePublished(opts *bind.WatchOpts, sink chan<- *HubMessagePublished, heir []common.Address) (event.Subscription, error) {

	var heirRule []interface{}
	for _, heirItem := range heir {
		heirRule = append(heirRule, heirItem)
	}

	logs, sub, err := _Hub.contract.WatchLogs(opts, "MessagePublished", heirRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HubMessagePublished)
				if err := _Hub.contract.UnpackLog(event, "MessagePublished", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseMessagePublished is a log parse operation binding the contract event 0x296f958024e31feaffa788f1f930bb472244f0307f637acb867fb63e3b2af2e0.
//
// Solidity: event MessagePublished(address indexed heir, string message)
func (_Hub *HubFilterer) ParseMessagePublished(log types.Log) (*HubMessagePublished, error) {
	event := new(HubMessagePublished)
	if err := _Hub.contract.UnpackLog(event, "MessagePublished", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// HubMessageRequestedToPublishIterator is returned from FilterMessageRequestedToPublish and is used to iterate over the raw logs and unpacked data for MessageRequestedToPublish events raised by the Hub contract.
type HubMessageRequestedToPublishIterator struct {
	Event *HubMessageRequestedToPublish // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *HubMessageRequestedToPublishIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(HubMessageRequestedToPublish)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(HubMessageRequestedToPublish)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *HubMessageRequestedToPublishIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *HubMessageRequestedToPublishIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// HubMessageRequestedToPublish represents a MessageRequestedToPublish event raised by the Hub contract.
type HubMessageRequestedToPublish struct {
	Heir common.Address
	Raw  types.Log // Blockchain specific contextual infos
}

// FilterMessageRequestedToPublish is a free log retrieval operation binding the contract event 0x795903a269979715c4c665a0485b134fc01a1244c8e91c6349e36c19f45cc8e4.
//
// Solidity: event MessageRequestedToPublish(address indexed heir)
func (_Hub *HubFilterer) FilterMessageRequestedToPublish(opts *bind.FilterOpts, heir []common.Address) (*HubMessageRequestedToPublishIterator, error) {

	var heirRule []interface{}
	for _, heirItem := range heir {
		heirRule = append(heirRule, heirItem)
	}

	logs, sub, err := _Hub.contract.FilterLogs(opts, "MessageRequestedToPublish", heirRule)
	if err != nil {
		return nil, err
	}
	return &HubMessageRequestedToPublishIterator{contract: _Hub.contract, event: "MessageRequestedToPublish", logs: logs, sub: sub}, nil
}

// WatchMessageRequestedToPublish is a free log subscription operation binding the contract event 0x795903a269979715c4c665a0485b134fc01a1244c8e91c6349e36c19f45cc8e4.
//
// Solidity: event MessageRequestedToPublish(address indexed heir)
func (_Hub *HubFilterer) WatchMessageRequestedToPublish(opts *bind.WatchOpts, sink chan<- *HubMessageRequestedToPublish, heir []common.Address) (event.Subscription, error) {

	var heirRule []interface{}
	for _, heirItem := range heir {
		heirRule = append(heirRule, heirItem)
	}

	logs, sub, err := _Hub.contract.WatchLogs(opts, "MessageRequestedToPublish", heirRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HubMessageRequestedToPublish)
				if err := _Hub.contract.UnpackLog(event, "MessageRequestedToPublish", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseMessageRequestedToPublish is a log parse operation binding the contract event 0x795903a269979715c4c665a0485b134fc01a1244c8e91c6349e36c19f45cc8e4.
//
// Solidity: event MessageRequestedToPublish(address indexed heir)
func (_Hub *HubFilterer) ParseMessageRequestedToPublish(log types.Log) (*HubMessageRequestedToPublish, error) {
	event := new(HubMessageRequestedToPublish)
	if err := _Hub.contract.UnpackLog(event, "MessageRequestedToPublish", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
