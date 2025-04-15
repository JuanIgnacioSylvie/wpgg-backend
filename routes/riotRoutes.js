require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');

// DTOs
const AccountDto = require('../dtos/account.dto');
const ParticipantDto = require('../dtos/participant.dto');
const MatchSummaryDto = require('../dtos/matchSummary.dto');
const ProfileAccountDto = require('../dtos/profile.dto');
const SummonerSpellsDto = require('../dtos/summonerSpells.dto');
const BuildDto = require('../dtos/build.dto');
const GameModeDto = require('../dtos/gameMode.dto');
const { QUEUE_DATA } = require('../dtos/queuedata.js');

/**
 * GET /api/riot/test
 * Endpoint de prueba.
 */
router.get('/test', (req, res) => {
    res.json({ message: '¡Endpoint de prueba funcionando!' });
});

/**
 * GET /api/riot/account/:puuid
 * Obtiene el AccountDto de un jugador usando su puuid.
 */
router.get('/account/:puuid', async (req, res) => {
    const { puuid } = req.params;
    const apiKey = process.env.RIOT_API_KEY;

    try {
        const accountDto = await getAccountDtoByPuuid(puuid, apiKey);
        if (!accountDto) {
            return res.status(404).json({ error: 'No se encontró la cuenta' });
        }
        res.json(accountDto);
    } catch (error) {
        console.error('Error al obtener la cuenta por puuid:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error al obtener la cuenta por puuid' });
    }
});

router.get('/profile/:gameName/:tagLine', async (req, res) => {
    const { gameName } = req.params;
    const { tagLine } = req.params;
    const apiKey = process.env.RIOT_API_KEY;

    try {
        const accountDto = await getAccountDtoByGameName(gameName, tagLine, apiKey);
        if (!accountDto) {
            return res.status(404).json({ error: 'No se encontró la cuenta' });
        }
        res.json(accountDto);
    } catch (error) {
        console.error('Error al obtener la cuenta por puuid:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error al obtener la cuenta por puuid' });
    }
});

/**
 * GET /api/riot/matches/:puuid
 */
router.get('/matches/:puuid', async (req, res) => {
    const { puuid } = req.params;
    const apiKey = process.env.RIOT_API_KEY;

    try {
        const matchIdsResp = await axios.get(
            `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`
        );
        const matchIds = matchIdsResp.data;

        const matchDetailsPromises = matchIds.map(async (matchId) => {
            const matchResp = await axios.get(
                `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`
            );
            return parseMatchSummary(matchResp.data, apiKey);
        });

        const matchesSummary = await Promise.all(matchDetailsPromises);
        res.json(matchesSummary);
    } catch (error) {
        console.error('Error al obtener matches:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error al obtener las partidas del usuario' });
    }
});

/**
 * GET /api/riot/profile-account/:puuid
 */
router.get('/profile-account/:puuid', async (req, res) => {
    const { puuid } = req.params;
    const apiKey = process.env.RIOT_API_KEY;

    try {
        const response = await axios.get(
            `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}?api_key=${apiKey}`
        );
        const data = response.data;

        const profileAccountDto = new ProfileAccountDto({
            id: data.id,
            accountId: data.accountId,
            puuid: data.puuid,
            profileIconId: data.profileIconId,
            revisionDate: data.revisionDate,
            summonerLevel: data.summonerLevel,
        });

        res.json(profileAccountDto);
    } catch (error) {
        console.error('Error al obtener perfil de cuenta:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error al obtener perfil de cuenta' });
    }
});

// --------------------------------------------------------------------------------
// Funciones de ayuda
// --------------------------------------------------------------------------------

/**
 * Dado un queueId, busca la información en QUEUE_DATA y retorna un GameModeDto.
 * Si no existe, retorna un objeto con valores por defecto.
 */
function getGameModeDtoByQueueId(queueId) {
    const found = QUEUE_DATA.find((mode) => mode.queueId === queueId);
    if (!found) {
        return new GameModeDto({
            queueId,
            map: 'Unknown',
            description: null,
            notes: null,
        });
    }
    return new GameModeDto(found);
}

async function getAccountDtoByPuuid(puuid, apiKey) {
    try {
        const response = await axios.get(
            `https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${apiKey}`
        );
        const data = response.data;
        return new AccountDto({
            puuid: data.puuid,
            gameName: data.gameName,
            tagLine: data.tagLine,
        });
    } catch (error) {
        console.error(`Error fetching account by puuid ${puuid}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

async function getAccountDtoByGameName(gameName, tagLine, apiKey) {
    try {
        const response = await axios.get(
            `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`
        );
        const data = response.data;
        return new AccountDto({
            puuid: data.puuid,
            gameName: data.gameName,
            tagLine: data.tagLine,
        });
    } catch (error) {
        console.error(`Error fetching account by puuid ${gameName}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

async function getProfileDtoByPuuid(puuid, apiKey) {
    try {
        const response = await axios.get(
            `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}?api_key=${apiKey}`
        );
        const data = response.data;
        return new ProfileAccountDto({
            puuid: data.puuid,
            gameName: data.name,
            tagLine: '', // No se provee tagLine en este endpoint
            profileIconId: data.profileIconId,
            summonerLevel: data.summonerLevel,
        });
    } catch (error) {
        console.error(`Error fetching profile for puuid ${puuid}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

async function enrichParticipant(participant, apiKey) {
    if (!participant || !participant.puuid) return null;
    const accountDto = await getAccountDtoByPuuid(participant.puuid, apiKey);

    const summonerSpellsDto = new SummonerSpellsDto({
        summoner1Id: participant.summoner1Id,
        summoner2Id: participant.summoner2Id,
        summoner1Casts: participant.summoner1Casts,
        summoner2Casts: participant.summoner2Casts
    });

    const buildDto = new BuildDto({
        item0: participant.item0,
        item1: participant.item1,
        item2: participant.item2,
        item3: participant.item3,
        item4: participant.item4,
        item5: participant.item5,
        item6: participant.item6,
        itemsPurchased: participant.itemsPurchased,
        goldSpent: participant.goldSpent
    });

    return new ParticipantDto({
        championName: participant.championName,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        goldEarned: participant.goldEarned,
        win: participant.win,
        accountDto,
        summonerSpellsDto,
        buildDto
    });
}

/**
 * Toma la data cruda de un match y retorna un MatchSummaryDto,
 * adjuntando la información detallada del modo de juego a partir del queueId.
 */
async function parseMatchSummary(matchData, apiKey) {
    const enrichedParticipants = await Promise.all(
        matchData.info.participants.map(p => enrichParticipant(p, apiKey))
    );

    // Obtenemos nuestro GameModeDto a partir del queueId
    const gameModeDto = getGameModeDtoByQueueId(matchData.info.queueId);

    return new MatchSummaryDto({
        matchId: matchData.metadata.matchId,
        gameDuration: matchData.info.gameDuration,
        participants: enrichedParticipants.filter(p => p !== null),
        gameModeDto
    });
}

module.exports = router;
