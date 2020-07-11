// load crednetials
const keys = require('./keys');

// Express App Setup
// Libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Express application - Receive and Respond to any HTTP request to the React application
const app = express();
app.use(cors()); // Cross origin resource sharing - make requests from 1 domain/ port to another (react to express port)
app.use(bodyParser.json()); // parse incoming request and turn the body to a json format

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClient.on('connect', () => {
    pgClient
        .query('CREATE TABLE IF NOT EXISTS values (number INT)')
        .catch((err) => console.log(err));
});


// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate(); // Reading and Responding

// Express router handlers
// Hitting the source route
app.get('/', (req, res) => {
    res.send('Hi');
});

// Route to retrieve values from Postgres
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows);
});

// Route to retrieve values from Redis
app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

// Route post info from React app to Express app
app.post('/values', async (req, res) => {
    const index = req.body.index;

    // Avoid too long calculations
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    // Put into Redis db
    redisClient.hset('values', index, 'Nothing yet!'); // Replace Nothing yet after calculations
    redisPublisher.publish('insert', index);
    // Store value in Postgers
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening');
});