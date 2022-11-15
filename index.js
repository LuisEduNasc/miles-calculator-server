'use strict'

const express = require('express');
const cors = require('cors');
const haversine = require('haversine-distance')

const {cities} = require('./data/cities.json');

const app = express();
app.use(cors());

const getCitiesByName = query => {
  return cities.filter(city => {
    const patt = new RegExp(query, 'gi');
    return patt.test(city[0])
  })
};

const kilometersCalculation = (firstCity, secondCity) => {
  const meters =  haversine(
    {latitude: firstCity[1], longitude: firstCity[2]},
    {latitude: secondCity[1], longitude: secondCity[2]}
  );

  return (meters / 1000).toFixed(1)
}

app.get('/', (req, res) => {
  return res.send('Up and running...')
});

app.get('/api/v1/cities', (req, res) => {
  if (!req.query.q) return res.json(cities);
  if (req.query.q === 'fail') return res.sendStatus(404);

  const foundResults = getCitiesByName(req.query.q);

  return res.json({
    cities: foundResults
  });
});

app.get('/api/v1/kilometers', (req, res) => {
  if (!req.query.q) return res.send('No cities was found to perform the calculation.')

  const citiesQuery = req.query.q.split(',')

  if (citiesQuery.indexOf('Dijon') !== -1) return res.sendStatus(404);

  const kilometersResponse = []
  for (let idx = 0; idx < citiesQuery.length - 1; idx++) {
    const originCity = citiesQuery[idx];
    const destinationCity = citiesQuery[idx + 1];

    const originCityArray = getCitiesByName(originCity)[0];
    const destinationCityArray = getCitiesByName(destinationCity)[0];

    const kilometers = kilometersCalculation(originCityArray, destinationCityArray);

    kilometersResponse.push({id: idx, origin: originCity, destiny: destinationCity, kilometers});
  }

  return res.json(kilometersResponse)
})

const server = app.listen(8000, 'localhost', () => {
  console.log(`API listen on http://${server.address().address}:${server.address().port}`)
})
