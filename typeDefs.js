const fs = require('fs');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { mergeResolvers } = require('@graphql-tools/merge');

// Helper function to read a GraphQL file
const readGraphQLFile = (filePath) =>
    fs.readFileSync(filePath, 'utf8');

// Reading GraphQL files
const walletModel = readGraphQLFile('./schemas/walletModel.graphql');
const notificationsModel = readGraphQLFile('./schemas/notificationsModel.graphql');
const favoritesModel = readGraphQLFile('./schemas/favoritesModel.graphql');
const categoriesModel = readGraphQLFile('./schemas/categoriesModel.graphql');
const transactionModel = readGraphQLFile('./schemas/transactionModel.graphql');
const countriesModel = readGraphQLFile('./schemas/countriesModel.graphql');
const eventModel = readGraphQLFile('./schemas/eventModel.graphql');
const followingModel = readGraphQLFile('./schemas/followingModel.graphql');
const userModel = readGraphQLFile('./schemas/userModel.graphql');
const ticketModel = readGraphQLFile('./schemas/ticketModel.graphql');
const scannerModel = readGraphQLFile('./schemas/scannerModel.graphql');
const promotionModel = readGraphQLFile('./schemas/promotionModel.graphql');
const venueModel = readGraphQLFile('./schemas/venueModel.graphql');
const referralCodeModel = readGraphQLFile('./schemas/referralCodeModel.graphql');
const otpModel = readGraphQLFile('./schemas/otpModel.graphql');
const pointsModel = readGraphQLFile('./schemas/pointsModel.graphql');
const combinedQuery = readGraphQLFile('./schemas/combinedQuery.graphql');
const combinedMutation = readGraphQLFile('./schemas/combinedMutations.graphql');


// resolver imports here
const walletResolvers = require('./resolvers/walletResolver');
// const notificationsResolvers = require('./resolvers/notificationsResolvers');
// const favoritesResolvers = require('./resolvers/favoritesResolvers');
// const categoriesResolvers = require('./resolvers/categoriesResolvers');
const transactionResolvers = require('./resolvers/transactionResolver');
// const countriesResolvers = require('./resolvers/countriesResolvers');
const eventResolvers = require('./resolvers/eventResolver');
// const followingResolvers = require('./resolvers/followingResolvers');
const userResolvers = require('./resolvers/userResolver');
const ticketResolvers = require('./resolvers/ticketResolver');
const scannerResolvers = require('./resolvers/scannerResolver');
// const promotionResolvers = require('./resolvers/promotionResolver');
const venueResolvers = require('./resolvers/venueResolver');
// const referralCodeResolvers = require('./resolvers/referralCodeResolvers');
// const otpResolvers = require('./resolvers/otpResolvers');
// const pointsResolvers = require('./resolvers/pointsResolvers');

exports.typeDefs = mergeTypeDefs([
    walletModel,
    notificationsModel,
    favoritesModel,
    categoriesModel,
    transactionModel,
    countriesModel,
    eventModel,
    followingModel,
    userModel,
    ticketModel,
    scannerModel,
    promotionModel,
    venueModel,
    referralCodeModel,
    otpModel,
    pointsModel,
    combinedQuery,
    combinedMutation,
]);

exports.resolvers = mergeResolvers([
    walletResolvers,
    // notificationsResolvers,
    // favoritesResolvers,
    // categoriesResolvers,
    transactionResolvers,
    // countriesResolvers,
    eventResolvers,
    // followingResolvers,
    userResolvers,
    ticketResolvers,
    scannerResolvers,
    // promotionResolvers,
    venueResolvers,
    // referralCodeResolvers,
    // otpResolvers,
    // pointsResolvers
]);