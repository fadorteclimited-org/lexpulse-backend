const Ticket = require("../models/ticketModel");

async function getUserTickets(_, { id }) {
   try {
       return await Ticket.find({attendeeId: id}).exec();
   } catch (error) {
       throw new Error('Error getting user tickets: ' + error.message);
   }
}

async function createTicket(_, { input }) {
    try {
        const ticket = new Ticket(input);
        await ticket.save();
        return ticket;
    } catch (error) {
        throw new Error("Error creating ticket: " + error.message);
    }
}

async function updateTicket(_, { id, input }) {
    try {
        const ticket = await Ticket.findByIdAndUpdate(id, input, { new: true });
        if (!ticket) {
            throw new Error("Ticket not found");
        }
        return ticket;
    } catch (error) {
        throw new Error("Error updating ticket: " + error.message);
    }
}

async function deleteTicket(_, { id }) {
    try {
        const ticket = await Ticket.findByIdAndDelete(id);
        if (!ticket) {
            throw new Error("Ticket not found");
        }
        return ticket;
    } catch (error) {
        throw new Error("Error deleting ticket: " + error.message);
    }
}

async function getEventReservations(_, { id }) {
    try {
        const tickets = await Ticket.find({eventId: id}).populate('attendeeId').exec()


        return tickets.map(ticket => ({
            ...ticket.toJSON(),
            attendeeId: ticket.attendeeId._id,
            user: ticket.attendeeId
        }));
    } catch (e) {

    }
}
module.exports = {
    Query: {
        getUserTickets,
        getEventReservations,
    },
    Mutation: {
        createTicket,
        updateTicket,
        deleteTicket
    }
};