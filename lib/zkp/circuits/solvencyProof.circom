pragma circom 2.0.0;

// Input signals:
// - totalAssets: total assets held by the exchange
// - totalLiabilities: total user deposits/liabilities
// - userBalances: array of user balances
// - merkleRoot: root of the Merkle tree containing all user balances

template SolvencyCheck() {
    signal input totalAssets;
    signal input totalLiabilities;
    signal input userBalances[100]; // Example size, adjust as needed
    signal input merkleRoot;
    signal output isSolvent;
    signal output proofOfReserves;

    // Verify total liabilities match sum of user balances
    var sumBalances = 0;
    for (var i = 0; i < 100; i++) {
        sumBalances += userBalances[i];
    }
    totalLiabilities === sumBalances;

    // Check if assets cover liabilities
    isSolvent <== totalAssets >= totalLiabilities ? 1 : 0;

    // Generate proof of reserves (simplified for demo)
    proofOfReserves <== totalAssets - totalLiabilities;
}

component main = SolvencyCheck();