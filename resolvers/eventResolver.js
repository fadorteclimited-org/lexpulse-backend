const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const Transaction = require('../models/transactionModel');
async function approveEvent(_, { id }) {
    try {
        const event = await Event.findById(id);
        if (event) {
            event.approved = true;
            event.flagged = false;
            event.reason = '';
            await event.save();
            return event;
        }
    } catch (err) {
        // Handle error
    }
}

async function getHostEvents(_, { id }) {
    try {
        return Event.find({ eventHostId: id });
    } catch (err) {
        // Handle error
    }
}

async function getUnapprovedEvents(_) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let query = {
            approved: false,
            eventDate: { $gte: today },
        };

        return await Event.find(query).exec();
    } catch (err) {
        // Handle error
    }
}

async function getTodayEvents(_) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let query = {
            approved: false,
            eventDate: {
                $gte: today,
                $lt: tomorrow
            },
        };

        return await Event.find(query).exec();
    } catch (e) {

    }
}

async function getEvent(_, { id }) {
    try {
        console.log(id)
        return await Event.findById(id).exec();
    } catch (e) {

    }
}

async function flagEvent(_, { id,reason }) {
   try {
       const event = await Event.findById(id);
       if (event) {
           event.approved = false;
           event.flagged = true;
           event.reason = reason;
           await event.save();
           return event;
       }
   } catch (e) {

   }
}

async function deleteEvent(_, { id }) {
    try {
        return await Event.findByIdAndDelete(id).exec();
    } catch (e) {

    }
}

async function getEventTransactions(_, { id }) {
   try {
       const transactions = await Transaction.find({eventId: id}).exec()
       return transactions;
   } catch (e) {
       
   }
}

async function getEventReservations(_, { id }) {
    try {
        const tickets = await Ticket.find({eventId: id}).exec()
        return tickets;
    } catch (e) {

    }
}

module.exports = {
    Event: {
        id: (parent) => parent._id.toString(),
        eventDate: (parent) => {
            console.log(parent.eventDate);
            return new Date(parent.eventDate).toISOString();
        },
        endSalesDate: (parent) => new Date(parent.endSalesDate).toISOString(),
        createdAt: (parent) => new Date(parent.createdAt).toISOString(),

    },
    Ticket: {
        id: (parent) => parent._id.toString(),
    },
    Transaction: {
        id: (parent) => parent._id.toString(),
    },
    TicketInfo: {

    },
    Query: {
        getHostEvents,
        getUnapprovedEvents,
        getTodayEvents,
        getEvent,
        getEventReservations,
        getEventTransactions,
    },
    Mutation: {
        approveEvent,
        flagEvent,
        deleteEvent,
    },
};