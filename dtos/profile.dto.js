class ProfileAccountDto {
    constructor({ puuid, gameName, tagLine, profileIconId, summonerLevel }) {
        this.puuid = puuid;
        this.gameName = gameName;
        this.tagLine = tagLine;
        this.profileIconId = profileIconId;
        this.summonerLevel = summonerLevel;
    }
}

module.exports = ProfileAccountDto;
