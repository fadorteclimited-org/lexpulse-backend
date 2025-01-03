const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Payout = require('../models/payoutModel');
const Wallet = require('../models/walletModel');
const WithdrawalAccount = require('../models/withdrawalAccountModel');
const axios = require("axios");
const process = require("node:process");
const { v4: uuidv4 } = require('uuid');
const countryData = require('country-data');




exports.calculateWeightedRating = async (eventId) => {
    const event = await Event.findById(eventId);
    if (event) {
        const {viewCount, ticketSales} = event;
        const weightedRating = (0.4 * viewCount) + (0.6 * ticketSales);
        event.weightedRating = weightedRating;
        await event.save();
        return weightedRating;
    }
};



// Function to get ISO3 country name from country name
function getISO3CountryName(countryName) {
    const country = countryData.countries.all.find(country => country.name.toLowerCase() === countryName.toLowerCase());

    if (country) {
        return country.alpha3;
    } else {
        return `Country with name ${countryName} not found.`;
    }
}
exports.getISO3CountryName = getISO3CountryName;

const convertCurrency = async (amount, currency) => {
    try {
        if (currency && currency !== 'GHS') {
            const ratesUrl = `https://open.er-api.com/v6/latest/${currency}`;
            const response = await axios.get(ratesUrl);
            const data = response.data;
            const exchangeRates = data.rates;
            if (!exchangeRates || !exchangeRates['GHS']) {
                throw new Error('Exchange rate for GHS not found');
            }
            return amount * exchangeRates['GHS'] * 1.035;
        } else {
            return amount;
        }
    } catch (e) {

        throw new Error('Error getting exchange rates');
    }
};

exports.convertCurrency = convertCurrency;


exports.initiatePaystackPayment = async (email, amount,event,callback_url,reference) => {
        const finalAmount = await convertCurrency(amount, event.currency)
        console.log(finalAmount);
        const paymentUrl = `https://api.paystack.co/transaction/initialize`;
        const response = await axios.post(paymentUrl, {
            reference,
            amount: (finalAmount * 100).toFixed(0),
            email,
            callback_url,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });
        return response.data;
}

exports.initiatePowerPayment = async (email, amount,event,callback_url,reference) => {
    const paymentUrl = `https://api.sandbox.pawapay.cloud/v1/widget/sessions`;
    const iso3CountryName = getISO3CountryName(event.country);


    const generatedUUID = uuidv4();
    console.log(`Generated UUID: ${generatedUUID}` , amount);
    const response = await axios.post(paymentUrl,{
        "depositId": generatedUUID,
        "returnUrl": `${callback_url}?reference=${reference}`,
        "amount": `${amount}`,
        "language": "EN",
        "country": iso3CountryName,
        "reason": event.eventName,
    }, { headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PAWAPAY_SECRET_KEY}`
        }})
    return {
        redirectUrl: response.data.redirectUrl,
        reference: generatedUUID,
    };
}


exports.updateBalance = async (userId) => {
    const events = await Event.find({ eventHostId: userId }).exec();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const user = await User.findById(userId).exec();

    for (const event of events) {
        let endDate;
        try {
            endDate = new Date(event.eventEnd);
        } catch (e) {
            if (event.eventEnd) {
                const eventDate = new Date(event.eventDate);
                const [hours, minutes] = event.eventEnd.split(':');
                eventDate.setUTCHours(hours, minutes, 0, 0);
                endDate = eventDate;

                if (isNaN(endDate)) {
                    const [hours, minutes] = event.eventEnd.split(':');
                    eventDate.setUTCHours(hours, minutes, 0, 0);
                    endDate = eventDate;
                }

                if (today > endDate) {
                    user.availableBalance += user.pendingBalance;
                    user.pendingBalance = 0;
                }
            }
        }
    }
    
    await user.save();
}

exports.createPaystackRecipient = async (userId,type, name,account_number,bank_code,currency) => {

    try {
        const response = await axios.post('https://api.paystack.co/transferrecipient', {
            type: type,
            name: name,
            account_number: account_number,
            bank_code: bank_code,
            currency: currency,
            metadata: {
                userId: userId
            }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        return response.data.data;
    } catch (error)  {
        console.log(error);
        throw new Error('User not created: ' + error.message);
    }
}

exports.completePawaPayPayout = async (amount,payout,account) => {
    try {
        const generatedUUID = uuidv4();
        const response = await axios.post('https://api.sandbox.pawapay.io/payouts', {
            payoutId: generatedUUID,
            amount: amount,
            currency: account.currency,
            correspondent: account.bankCode,
            recipient: {
                type: '',
                address: {value: account.accountNumber}
            },
            "customerTimestamp": new Date(payout.createdAt).toISOString(),
            "statementDescription": `Lexpulse Payout #${payout._id}`,
        }, {headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.PAWAPAY_SECRET_KEY}`
            }})

        return {
            transactionId: response.data.payoutId,
            status: response.data.status,
        }

    } catch (e) {
        throw new Error('failed to complete payout')
    }
}

exports.completePaystackPayout = async (amount,payout,account) => {
    try {
        const response = await axios.post('https://api.paystack.co/transfer',{
            source: 'balance',
            reason: `Lexpulse Payout #${payout._id}`,
            amount: amount * 100,
            recipient: account.recipient_code,
        })
        return {
            status: response.data.data.status,
            transactionId: response.data.data.transfer_code,
        }
    } catch (e) {
        throw new Error('failed to complete payout')
    }
}
