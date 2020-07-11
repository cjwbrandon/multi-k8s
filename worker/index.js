// REDIS credentials
const keys = require('./keys');
// Connection to Redis Server
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 // retry connecting every 1 sec
});

const sub = redisClient.duplicate();

// Function to calculate Fibonacci sequence - recursion way
function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// Watch Redis for new index whenever a new message comes on
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert'); // Whenever someone inserts into Redis