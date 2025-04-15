/**
 * Representa la información de un participante en una partida,
 * incluyendo estadísticas básicas, su AccountDto, sus hechizos de invocador y su build.
 */
class ParticipantDto {
    constructor({ championName, kills, deaths, assists, goldEarned, win, accountDto, summonerSpellsDto, buildDto }) {
        this.championName = championName;
        this.kills = kills;
        this.deaths = deaths;
        this.assists = assists;
        this.goldEarned = goldEarned;
        this.win = win;
        this.accountDto = accountDto; // Instancia de AccountDto
        this.summonerSpellsDto = summonerSpellsDto; // Instancia de SummonerSpellsDto
        this.buildDto = buildDto; // Instancia de BuildDto
    }
}

module.exports = ParticipantDto;
