// routes/riotRoutes.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Importamos los DTOs
const AccountDto = require('../dtos/account.dto');
const ParticipantDto = require('../dtos/participant.dto');
const MatchSummaryDto = require('../dtos/matchSummary.dto');

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

/**
 * GET /api/riot/matches/:puuid
 * 1) Obtiene los últimos 20 matchIds de un jugador (por puuid).
 * 2) Para cada matchId, obtiene los detalles de la partida.
 * 3) Para cada participante, se obtiene su AccountDto vía su puuid y se crea un ParticipantDto.
 * 4) Devuelve un MatchSummaryDto con un array "participants" enriquecido.
 */
router.get('/matches/:puuid', async (req, res) => {
    const { puuid } = req.params;
    const apiKey = process.env.RIOT_API_KEY;

    try {
        // 1) Obtener los últimos 20 matchIds
        const matchIdsResp = await axios.get(
            `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`
        );
        const matchIds = matchIdsResp.data; // Array de match IDs

        // 2) Para cada matchId, obtener detalles y parsear
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

/* --------------------------------------------------
 *  FUNCIONES DE AYUDA
 * --------------------------------------------------
 */

/**
 * Llamada a /riot/account/v1/accounts/by-puuid/{puuid}
 * para construir un AccountDto a partir del puuid.
 */
async function getAccountDtoByPuuid(puuid, apiKey) {
    console.log("Obteniendo account para puuid:", puuid);
    try {
        const response = await axios.get(
            `https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${apiKey}`
        );
        console.log("Respuesta para puuid", puuid, response.data);
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

/**
 * Enriquecer un participante: obtiene su AccountDto y retorna un ParticipantDto.
 */
async function enrichParticipant(participant, apiKey) {
    if (!participant || !participant.puuid) {
        console.error("Participante sin puuid:", participant);
        return null;
    }
    const accountDto = await getAccountDtoByPuuid(participant.puuid, apiKey);
    return new ParticipantDto({
        championName: participant.championName,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        goldEarned: participant.goldEarned,
        win: participant.win,
        accountDto, // Puede ser null si no se obtuvo información
    });
}

/**
 * parseMatchSummary(matchData, apiKey)
 * Toma la data de la partida y crea un MatchSummaryDto con un array "participants"
 * donde cada participante está enriquecido con su AccountDto a través de un ParticipantDto.
 */
async function parseMatchSummary(matchData, apiKey) {
    const participants = matchData.info.participants || [];

    // Enriquecer cada participante
    const enrichedParticipants = await Promise.all(
        participants.map((p) => enrichParticipant(p, apiKey))
    );

    // Filtrar participantes válidos
    const validParticipants = enrichedParticipants.filter(p => p !== null);

    return new MatchSummaryDto({
        matchId: matchData.metadata.matchId,
        gameMode: matchData.info.gameMode,
        gameDuration: matchData.info.gameDuration,
        participants: validParticipants,
    });
}

module.exports = router;
