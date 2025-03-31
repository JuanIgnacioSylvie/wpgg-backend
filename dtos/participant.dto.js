// dtos/participant.dto.js

/**
 * Representa la información de un participante en una partida,
 * incluyendo estadísticas básicas y su AccountDto.
 */
class ParticipantDto {
    constructor({ championName, kills, deaths, assists, goldEarned, win, accountDto }) {
        this.championName = championName;
        this.kills = kills;
        this.deaths = deaths;
        this.assists = assists;
        this.goldEarned = goldEarned;
        this.win = win;
        this.accountDto = accountDto; // Instancia de AccountDto
    }
}

module.exports = ParticipantDto;
