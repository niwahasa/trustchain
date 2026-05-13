// SPDX-License-Identifier: MIT
pragma warning disable 0.8.0;

pragma solidity ^0.8.0;

contract TrustChain {
    struct DocumentRecord {
        bytes32 hash;
        bool exists;
        bool isActive;
        uint256 timestamp;
        address owner;
        uint256 signerCount;
        string verificationId;
        string ipfsCid;
        uint8 docType;
    }

    struct ReceiptRecord {
        bytes32 hash;
        string receiptId;
        string receiptNo;
        string customerEmail;
        uint256 amountInCents;
        string currency;
        bool isPaid;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => DocumentRecord) public documents;
    mapping(string => ReceiptRecord) public receipts;
    address public owner;

    event DocumentRegistered(bytes32 indexed hash, string verificationId, address owner);
    event DocumentSigned(bytes32 indexed hash, string email);
    event ReceiptRegistered(string indexed receiptId, string receiptNo, uint256 amount);
    event ReceiptPaid(string indexed receiptId);

    constructor() {
        owner = msg.sender;
    }

    function registerDocument(
        bytes32 _hash,
        string memory _verificationId,
        string memory _ipfsCid,
        uint8 _docType
    ) public {
        require(!documents[_hash].exists, "Document already exists");
        documents[_hash] = DocumentRecord({
            hash: _hash,
            exists: true,
            isActive: true,
            timestamp: block.timestamp,
            owner: msg.sender,
            signerCount: 0,
            verificationId: _verificationId,
            ipfsCid: _ipfsCid,
            docType: _docType
        });
        emit DocumentRegistered(_hash, _verificationId, msg.sender);
    }

    function signDocument(bytes32 _hash, string memory _email) public {
        require(documents[_hash].exists, "Document does not exist");
        documents[_hash].signerCount++;
        emit DocumentSigned(_hash, _email);
    }

    function registerReceipt(
        bytes32 _hash,
        string memory _receiptId,
        string memory _receiptNo,
        string memory _customerEmail,
        uint256 _amountInCents,
        string memory _currency,
        bool _isPaid
    ) public {
        require(!receipts[_receiptId].exists, "Receipt already exists");
        receipts[_receiptId] = ReceiptRecord({
            hash: _hash,
            receiptId: _receiptId,
            receiptNo: _receiptNo,
            customerEmail: _customerEmail,
            amountInCents: _amountInCents,
            currency: _currency,
            isPaid: _isPaid,
            timestamp: block.timestamp,
            exists: true
        });
        emit ReceiptRegistered(_receiptId, _receiptNo, _amountInCents);
    }

    function markReceiptPaid(string memory _receiptId) public {
        require(receipts[_receiptId].exists, "Receipt does not exist");
        receipts[_receiptId].isPaid = true;
        emit ReceiptPaid(_receiptId);
    }
}
