// routes/riotRoutes.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const AccountDto = require('../dtos/account.dto');

/**
 * GET /api/riot/test
 * Endpoint de prueba.
 */
router.get('/test', (req, res) => {
    res.json({ message: '¡Endpoint de prueba funcionando!' });
});

/**
 * GET /api/riot/summoner/:name
 * Si quieres replicar también con query param, ajusta la URL:
 */
router.get('/summoner/:name', async (req, res) => {
    const summonerName = req.params.name;
    const apiKey = process.env.RIOT_API_KEY;

    try {
        const response = await axios.get(
            `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${apiKey}`
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener summoner:', error);
        res.status(500).json({ error: 'Error al obtener datos del summoner' });
    }
});

/**
 * GET /api/riot/account/:gameName/:tagLine
 * Replicamos la llamada EXACTA con ?api_key= al final.
 */
router.get('/account/:gameName/:tagLine', async (req, res) => {
    const { gameName, tagLine } = req.params;
    const apiKey = process.env.RIOT_API_KEY;

    try {
        const response = await axios.get(
            `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`
        );

        const accountDto = new AccountDto({
            puuid: response.data.puuid,
            gameName: response.data.gameName,
            tagLine: response.data.tagLine,
        });

        res.json(accountDto);
    } catch (error) {
        console.error('Error al obtener la cuenta por Riot ID:', error);
        res.status(500).json({ error: 'Error al obtener la cuenta por Riot ID' });
    }
});

module.exports = router;
