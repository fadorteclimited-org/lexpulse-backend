const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
var cors = require('cors');

const Event = require('./models/eventModel');
const Ticket = require('./models/ticketModel');

var cron = require('node-cron');
const bodyParser = require('body-parser');

dotenv.config({ path: './config/config.env' });
connectDB();

const events = require('./routes/eventRoute');
const tickets = require('./routes/ticketRoute');
const points = require('./routes/pointsRoute');
const referralCode = require('./routes/referralCodeRoute');
const following = require('./routes/followingRoute');
const favorites = require('./routes/favoritesRoute');
const categories = require('./routes/categoriesRoute');
const countries = require('./routes/countriesRoute');
const notifications = require('./routes/notificationsRoute');
const stats = require('./routes/statsRoute');
const users = require('./routes/userRoute');
const auth = require('./routes/authRoute');
const venues = require('./routes/venueRoute');
const transactions = require('./routes/transactionRoute');
const utils = require('./routes/utilsRoute');
const scanner = require('./routes/scannerRoute');
const payouts = require('./routes/payoutsRoute');
const admin = require('./routes/adminRoute');
const adminAuth = require('./middleware/adminAuth');
const {typeDefs, resolvers} = require("./typeDefs");
function errorLogger(err, req, res, next) {
    console.error(`Error encountered on ${req.path} [${req.method}]:`, err);
    next(err);
}

const startServer = async () => {
    const server = new ApolloServer({ typeDefs, resolvers,introspection: true,playground: true, });

    await server.start(); // Ensure server.start() is awaited
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.options('*', cors());
    app.use(express.static(__dirname + '/public'));
    app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

    app.use('/api/v1/events', events);
    app.use('/api/v1/tickets', tickets);
    app.use('/api/v1/points', points);
    app.use('/api/v1/referral-codes', referralCode);
    app.use('/api/v1/following', following);
    app.use('/api/v1/favorites', favorites);
    app.use('/api/v1/categories', categories);
    app.use('/api/v1/countries', countries);
    app.use('/api/v1/notifications', notifications);
    app.use('/api/v1/stats', stats);
    app.use('/api/v1/users', users);
    app.use('/api/v1/auth', auth);
    app.use('/api/v1/venues', venues);
    app.use('/api/v1/transactions', transactions);
    app.use('/api/v1/utils', utils);
    app.use('/api/v1/scanners', scanner);
    app.use('/api/v1/payouts', payouts);
    app.use('/api/v1/admin', admin);
    app.use('/graphql',adminAuth, expressMiddleware(server),errorLogger);

cron.schedule('0 0 * * *', async () => {
    try {
        console.log("Running cron job to check for completed events...");

        // Get the current date
        const currentDate = new Date();

        // Find all events that have ended (eventDate is in the past)
        const pastEvents = await Event.find({ eventDate: { $lt: currentDate } });

        // Loop through all past events and update associated tickets
        for (const event of pastEvents) {
            // Update tickets for the given eventId, set status to 'completed'
        await Ticket.updateMany(
            { eventId: event._id, status: { $ne: 'completed' } }, // Only update tickets that are not already 'completed'
            { $set: { status: 'completed' } }
        );
            console.log(`Updated tickets for event: ${event.eventName}`);
        }

        console.log("Ticket statuses updated for past events.");
    } catch (error) {
        console.error("Error running cron job:", error);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));
};

startServer();