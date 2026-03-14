// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InvoiceNFTManager is ERC721URIStorage, EIP712, Ownable {
    using ECDSA for bytes32;

    struct Invoice {
        address sme;
        address mnc;
        uint256 principal;
        uint256 repaymentAmount;
        string arweaveHash;
        uint8 status; // 0: Anchored, 1: Verified, 2: Funded, 3: Repaid, 4: Settled
        uint256 launchTime;
    }

    error InvalidStatus();
    error UnauthorizedMNC();
    error InvalidSignature();
    error TransferFailed();
    error NotVerified();
    error NotFunded();
    error NotRepaid();
    error NotNFTOwner();
    error InsufficientRepayment();
    error TransferPayoutFailed();

    bytes32 private constant INVOICE_TYPEHASH = keccak256("Invoice(string arweaveHash,uint256 amount)");

    mapping(uint256 => Invoice) public invoices;
    mapping(address => bool) public authorizedMNCs;
    mapping(uint256 => uint256) public interestReserve; // tokenId -> reserve amount

    uint256 public nextTokenId;
    IERC20 public immutable usdcToken;

    event InvoiceAnchored(uint256 indexed tokenId, address indexed sme, string arweaveHash);
    event InvoiceVerified(uint256 indexed tokenId, address indexed mnc, uint256 amount);
    event InvoiceFunded(uint256 indexed tokenId, address indexed investor);
    event InvoiceRepaid(uint256 indexed tokenId, uint256 amount);
    event InvoiceSettled(uint256 indexed tokenId, address indexed investor, uint256 payout);

    constructor(address _usdcToken) ERC721("InvoiceNFT", "INFT") EIP712("InvoiceManager", "1") Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }

    function addAuthorizedMnc(address _mnc) external onlyOwner {
        authorizedMNCs[_mnc] = true;
    }

    function anchorInvoice(string memory _arweaveHash, string memory _tokenURI) external {
        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        invoices[tokenId] = Invoice({
            sme: msg.sender,
            mnc: address(0),
            principal: 0,
            repaymentAmount: 0,
            arweaveHash: _arweaveHash,
            status: 0, // Anchored
            launchTime: block.timestamp
        });

        emit InvoiceAnchored(tokenId, msg.sender, _arweaveHash);
    }

    function verifyInvoice(uint256 _tokenId, uint256 _amount, bytes memory _signature) external {
        Invoice storage invoice = invoices[_tokenId];
        if (invoice.status != 0) revert InvalidStatus();
        
        bytes32 structHash = keccak256(abi.encode(INVOICE_TYPEHASH, keccak256(bytes(invoice.arweaveHash)), _amount));
        bytes32 hash = _hashTypedDataV4(structHash);
        
        address signer = ECDSA.recover(hash, _signature);
        if (!authorizedMNCs[signer]) revert UnauthorizedMNC();
        if (signer == address(0)) revert InvalidSignature();

        invoice.mnc = signer;
        invoice.principal = _amount;
        invoice.status = 1; // Verified

        emit InvoiceVerified(_tokenId, signer, _amount);
    }

    function invest(uint256 _tokenId) external {
        Invoice storage invoice = invoices[_tokenId];
        if (invoice.status != 1) revert NotVerified();
        
        uint256 amount = invoice.principal;
        if (!usdcToken.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();

        // Small fixed % reserve (e.g. 1%)
        uint256 reserve = (amount * 1) / 100;
        uint256 smeAmount = amount - reserve;

        interestReserve[_tokenId] = reserve;
        
        // Transfer to SME
        if (!usdcToken.transfer(invoice.sme, smeAmount)) revert TransferFailed();

        // Transfer NFT to investor
        _transfer(invoice.sme, msg.sender, _tokenId);

        invoice.status = 2; // Funded
        emit InvoiceFunded(_tokenId, msg.sender);
    }

    function repay(uint256 _tokenId, uint256 _repaymentAmount) external {
        Invoice storage invoice = invoices[_tokenId];
        if (invoice.status != 2) revert NotFunded();
        
        // Allow MNC or anyone to repay on behalf of MNC
        if (!usdcToken.transferFrom(msg.sender, address(this), _repaymentAmount)) revert TransferFailed();
        
        invoice.repaymentAmount += _repaymentAmount;
        invoice.status = 3; // Repaid
        emit InvoiceRepaid(_tokenId, _repaymentAmount);
    }

    function claim(uint256 _tokenId) external {
        Invoice storage invoice = invoices[_tokenId];
        if (invoice.status != 3) revert NotRepaid();
        if (ownerOf(_tokenId) != msg.sender) revert NotNFTOwner();

        uint256 N = calculateN(invoice.launchTime);
        uint256 rate = 5; // Fixed Rate of 5% for example
        uint256 interest = (invoice.principal * N * rate) / 100;
        uint256 totalPayout = invoice.principal + interest;

        if (invoice.repaymentAmount < totalPayout) revert InsufficientRepayment();

        // Payout to investor
        if (!usdcToken.transfer(msg.sender, totalPayout)) revert TransferPayoutFailed();
        
        invoice.status = 4; // Settled
        emit InvoiceSettled(_tokenId, msg.sender, totalPayout);
    }

    function calculateN(uint256 _launchTime) public view returns (uint256) {
        // N calculation: 10 if < 24h, 5 if >= 24h (Time-Weighted)
        if (block.timestamp <= _launchTime + 1 days) {
            return 10;
        } else {
            return 5;
        }
    }
}
