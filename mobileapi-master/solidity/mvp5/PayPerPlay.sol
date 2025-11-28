pragma solidity ^0.4.2;
contract PayPerPlay {
    string public constant contractVersion = "v0.5";

    address public owner;
    address public createdBy;
    string public title;
    address public artistProfileAddress;
    string public resourceUrl; // e.g. ipfs://<hash>
    string public metadataUrl;
    string public imageUrl;

    // license information
    uint public weiPerPlay;

    // fixed payment royaly amounts
    address[] public royalties;
    uint[] public royaltyAmounts;

    // proportional payments (dependent on weiPerPlay or tip size)
    address[] public contributors;
    uint[] public contributorShares;
    uint public totalShares;

    // book keeping
    mapping(address => uint) public pendingPayment;
    uint public playCount;
    uint public totalEarned;
    uint public tipCount;
    uint public totalTipped;
    uint public licenseVersion;
    uint public metadataVersion;

    // events
    event playEvent(uint plays);
    event tipEvent(uint plays, uint tipCount);
    event licenseUpdateEvent(uint version);
    event transferEvent(address oldOwner, address newOwner);
    event resourceUpdateEvent(string oldResource, string newResource);
    event imageUpdateEvent(string oldImage, string newImage);
    event metadataUpdateEvent(string oldMetadata, string newMetadata);
    event artistProfileAddressUpdateEvent(address oldArtistAddress, address newArtistAddress);

    // "Title", "0x11111", 1000000, "ipfs://resource", "ipfs://metadata", [], [], ["0x11111"], [1]
    function PayPerPlay(
            address _owner,
            string _title,
            address _artistProfileAddress,
            uint _weiPerPlay,
            string _resourceUrl,
            string _imageUrl,
            string _metadataUrl,
            address[] _royalties,
            uint[] _royaltyAmounts,
            address[] _contributors,
            uint[] _contributorShares) {
        title = _title;
        artistProfileAddress = _artistProfileAddress;
        owner = _owner;
        createdBy = msg.sender;
        resourceUrl = _resourceUrl;
        metadataUrl = _metadataUrl;
        imageUrl = _imageUrl;

        updateLicense(_weiPerPlay,
            _royalties, _royaltyAmounts,
            _contributors, _contributorShares);
    }

    modifier adminOnly {
        if (msg.sender != owner) throw;
        if (msg.value > 0) throw;
        _;
    }

    modifier noCoins {
        if (msg.value > 0) throw;
        _;
    }

    function tip() payable {
        // fixed royalty payments are
        // (1) contractual obligations for a *play* event
        // (2) sized accodingly to a single play
        // Since a tip is not a play event, the contributors are not
        // obliged to pay any per-play royalty.  Also, since a tip could
        // be of an arbitrary amount, it may not even be possible to pay
        // the royalties (the tip may be for less).  Therefore, do not
        // include fixed royalty payments when receiving a tip.
        distributePayment(msg.value, false);

        tipCount++;
        totalTipped += msg.value;
        totalEarned += msg.value;
    }

    function getContributorsLength() public constant returns(uint) {
        return contributors.length;
    }

    function getRoyaltiesLength() public constant returns(uint) {
        return royalties.length;
    }

    function play() payable {
        if (msg.value < weiPerPlay) throw;

        // users can only purchase one play at a time.  don't steal their money
        var toRefund = msg.value - weiPerPlay;

        // I believe there is minimal risk in calling the sender directly, as it
        // should not be able to stall the contract for any other callers.
        if (toRefund > 0 && !msg.sender.send(toRefund)) {
            throw;
        }

        distributePayment(weiPerPlay, true);
        totalEarned += weiPerPlay;
        playCount++;

        playEvent(playCount);
    }

    function collectPendingPayment() noCoins {
        var toSend = pendingPayment[msg.sender];
        pendingPayment[msg.sender] = 0;
        if (toSend > 0 && !msg.sender.send(toSend)) {
            // throw to ensure pendingPayment[msg.sender] is reverted
            throw;
        }
    }

    /*** Admin functions ***/

    function transferOwnership(address newOwner) adminOnly {
        address oldOwner = owner;
        owner = newOwner;
        transferEvent(oldOwner, newOwner);
    }

    function updateResourceUrl(string newResourceUrl) adminOnly {
        string memory oldResourceUrl = resourceUrl;
        resourceUrl = newResourceUrl;
        resourceUpdateEvent(oldResourceUrl, newResourceUrl);
    }

    function updateImageUrl(string newImageUrl) adminOnly {
        string memory oldImageUrl = imageUrl;
        imageUrl = newImageUrl;
        imageUpdateEvent(oldImageUrl, newImageUrl);
    }

    function updateArtistAddress(address newArtistAddress) adminOnly {
        address oldArtistAddress = artistProfileAddress;
        artistProfileAddress = newArtistAddress;
        artistProfileAddressUpdateEvent(oldArtistAddress, newArtistAddress);
    }

    function updateMetadataUrl(string newMetadataUrl) adminOnly {
        string memory oldMetadataUrl = metadataUrl;
        metadataUrl = newMetadataUrl;
        metadataVersion++;
        metadataUpdateEvent(oldMetadataUrl, newMetadataUrl);
    }

    /*
     * Updates share allocations.  All old allocations are over written
     */
    function updateLicense(uint _weiPerPlay,
        address[] _royalties, uint[] _royaltyAmounts,
        address[] _contributors, uint[] _contributorShares) adminOnly {

        if (_contributors.length != _contributorShares.length) throw;
        if (_royalties.length != _royaltyAmounts.length) throw;

        weiPerPlay = _weiPerPlay;
        contributors = _contributors;
        contributorShares = _contributorShares;
        royalties = _royalties;
        royaltyAmounts = _royaltyAmounts;
        totalShares = 0;

        for (uint c=0; c < contributors.length; c++) {
            totalShares += contributorShares[c];
        }

        uint totalRoyaltyAmounts = 0;
        for (uint r=0; r < royaltyAmounts.length; r++) {
            totalRoyaltyAmounts += royaltyAmounts[r];
        }

        // sanity checks

        // watch out for division by 0 if totalShares == 0
        if (totalShares == 0 && contributors.length > 0)
            throw;

        // can't payout more than we get per play
        if (totalRoyaltyAmounts > weiPerPlay)
            throw;

        licenseVersion++;
        licenseUpdateEvent(licenseVersion);
    }

    function distributeBalance() adminOnly {
        distributePayment(this.balance, false);
    }

    function kill(bool _distributeBalanceFirst) adminOnly {
        if (_distributeBalanceFirst) {
            distributeBalance(); // is there any risk here?
        }
        selfdestruct(owner);
    }

    /*** internal ***/
    bool private distributionReentryLock;
    modifier withDistributionLock {
        if (distributionReentryLock) throw;
        distributionReentryLock = true;
        _;
        distributionReentryLock = false;
    }

    function distributePayment(uint _total, bool payRoyalties) withDistributionLock internal {

        // when distributing the balance of the contract, it might not make
        // sense to pay the per-play royalties
        if (payRoyalties) {
            // each royalty entry gets a fixed amount (defined in wei)
            for (uint r=0; r < royalties.length; r++) {
                var royaltyAmount = royaltyAmounts[r];
                var royaltyAddress = royalties[r];
                if (royaltyAmount > 0 && !royaltyAddress.send(royaltyAmount)) {
                    pendingPayment[royaltyAddress] += royaltyAmount;
                }

                // subtract from the _total left to distribute to contributors
                _total -= royaltyAmount;
            }
        }

        // after royalties have been paid, contributors divide the remainder
        for (uint c=0; c < contributors.length; c++) {
            var amount = (contributorShares[c] * _total) / totalShares;
            var contributorAddress = contributors[c];

            if (amount > 0 && !contributorAddress.send(amount)) {
                // don't throw, otherwise the contract can stall
                pendingPayment[contributorAddress] += amount;
            }
        }
    }
}