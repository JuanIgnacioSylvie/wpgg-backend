// dtos/matchSummary.dto.js

/**
 * Representa el resumen de una partida, incluyendo:
 * - matchId, gameMode, gameDuration
 * - participants: array de ParticipantDto
 */
class MatchSummaryDto {
    constructor({ matchId, gameMode, gameDuration, participants }) {
        this.matchId = matchId;
        this.gameMode = gameMode;
        this.gameDuration = gameDuration;
        this.participants = participants;
    }
}

module.exports = MatchSummaryDto;
