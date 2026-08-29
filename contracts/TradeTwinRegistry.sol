// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TradeTwinRegistry — on-chain proof of twin registration, simulations, and achievements
contract TradeTwinRegistry {
    struct TwinRegistration {
        bytes32 twinHash;
        uint64 tradeCount;
        uint64 registeredAt;
        bool exists;
    }

    struct SimulationResult {
        int32 userReturnBps;
        int32 twinReturnBps;
        uint8 winner;
        uint8 rounds;
        uint64 recordedAt;
    }

    mapping(address => TwinRegistration) public twins;
    mapping(address => SimulationResult[]) private _simulations;
    mapping(address => mapping(bytes32 => bool)) public achievements;

    event TwinRegistered(address indexed trader, bytes32 twinHash, uint256 tradeCount);
    event SimulationRecorded(
        address indexed trader,
        int32 userReturnBps,
        int32 twinReturnBps,
        uint8 winner
    );
    event AchievementRecorded(address indexed trader, bytes32 achievementId);

    function registerTwin(bytes32 twinHash, uint256 tradeCount) external {
        twins[msg.sender] = TwinRegistration({
            twinHash: twinHash,
            tradeCount: uint64(tradeCount),
            registeredAt: uint64(block.timestamp),
            exists: true
        });
        emit TwinRegistered(msg.sender, twinHash, tradeCount);
    }

    function recordSimulation(
        int32 userReturnBps,
        int32 twinReturnBps,
        uint8 winner,
        uint8 rounds
    ) external {
        _simulations[msg.sender].push(
            SimulationResult({
                userReturnBps: userReturnBps,
                twinReturnBps: twinReturnBps,
                winner: winner,
                rounds: rounds,
                recordedAt: uint64(block.timestamp)
            })
        );
        emit SimulationRecorded(msg.sender, userReturnBps, twinReturnBps, winner);
    }

    function recordAchievement(bytes32 achievementId) external {
        require(!achievements[msg.sender][achievementId], "Achievement already recorded");
        achievements[msg.sender][achievementId] = true;
        emit AchievementRecorded(msg.sender, achievementId);
    }

    function getSimulationCount(address trader) external view returns (uint256) {
        return _simulations[trader].length;
    }

    function hasAchievement(address trader, bytes32 achievementId) external view returns (bool) {
        return achievements[trader][achievementId];
    }
}
