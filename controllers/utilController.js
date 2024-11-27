
//Route api/v1/utils/exchange/:currency
const {convertCurrency} = require("../utils/helper");
exports.getExchangeRate =async (req, res) => {

    const rate = convertCurrency(1,req.params.currency);

    res.status(200).send({
        rate: rate,
        currency: req.params.currency,
    })

}