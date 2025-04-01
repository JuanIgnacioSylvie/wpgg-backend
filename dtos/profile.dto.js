class ProfileAccountDto {
    constructor({ puuid, gameName, tagLine, profileIconId, summonerLevel }) {
        this.id = id;
        this.accountId = accountId;
        this.puuid = puuid;
        this.revisionDate = revisionDate;
        this.profileIconId = profileIconId;
        this.summonerLevel = summonerLevel;
    }
}

module.exports = ProfileAccountDto;
