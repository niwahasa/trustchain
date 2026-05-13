export const TRUST_CHAIN_ABI = [
  "function registerDocument(bytes32 _hash, string _verificationId, string _ipfsCid, uint8 _docType) public",
  "function signDocument(bytes32 _hash, string _email) public",
  "function verifyDocument(bytes32 _hash) public view returns (tuple(bytes32 hash, bool exists, bool isActive, uint256 timestamp, address owner, uint256 signerCount, string verificationId, string ipfsCid, uint8 docType))",
  "function registerReceipt(bytes32 _hash, string _receiptId, string _receiptNo, string _customerEmail, uint256 _amountInCents, string _currency, bool _isPaid) public",
  "function markReceiptPaid(string _receiptId) public",
  "function receipts(string) public view returns (bytes32 hash, string receiptId, string receiptNo, string customerEmail, uint256 amountInCents, string currency, bool isPaid, uint256 timestamp, bool exists)"
];
