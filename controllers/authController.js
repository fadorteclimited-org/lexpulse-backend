const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var postmark = require("postmark");
const {updateBalance} = require("../utils/helper");
var client = new postmark.ServerClient(process.env.POSTMARK_EMAIL_KEY);

// @desc Auth user
// @route POST /api/v1/auth
exports.checkUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({msg: 'Please enter all fields'});
        }
        const user = await User.findOne({email}).exec()

        if (!user) return res.status(400).json({msg: 'User does not exist'});

        if (user.activatedEmail === false) return res.status(400).json({msg: 'Email not verified'});

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({msg: 'Invalid credentials'});
        await updateBalance(user.id)
        jwt.sign(
            {...user,id: user.id},
            process.env.JWT_SECRET,
            {expiresIn: '365d'},
            (err, token) => {
                if (err) throw err;
                const extra = (user.userType === 'host') ? {
                    pendingBalance: user.pendingBalance || 0,
                    availableBalance: user.availableBalance || 0,
                    withdrawalAccounts: user.withdrawalAccounts || []
                } : {}
                res.json({
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        country: user.country,
                        gender: user.gender,
                        userType: user.userType,
                        image: user.image,
                        username: user.username,
                        organization: user.organization,
                        phone: user.phone,
                        activatedEmail: user.activatedEmail,
                        activatedPhone: user.activatedPhone,
                        accountActive: user.accountActive,
                        createdAt: user.createdAt,
                        ...extra
                    }
                });
            }
        );


    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    }
}

// @desc Auth user confirm code
// @route POST /api/v1/auth/confirm-code
exports.checkUserVerification = async (req, res, next) => {
    try {
        const {email, code} = req.body;

        if (!email || !code) {
            return res.status(400).json({msg: 'Please enter all fields'});
        }

        User.findOne({email})
            .then(async (user) => {
                if (!user) return res.status(400).json({msg: 'User does not exist'});

                const otpCode = await Otp.findOne({userId: user.id});

                if (moment() > moment(otpCode.expiredAt)) return res.status(400).json({msg: 'Code expired'});

                if (otpCode.activateCode !== Number(code)) return res.status(400).json({msg: 'Invalid code'});

                const userNew = await User.findByIdAndUpdate(user._id, {
                    activatedEmail: true
                }, {new: true});

                jwt.sign(
                    {id: user.id},
                    process.env.JWT_SECRET,
                    {expiresIn: '7d'},
                    (err, token) => {
                        if (err) throw err;

                        res.json({
                            token,
                            user: {
                                id: userNew.id,
                                firstName: userNew.firstName,
                                lastName: userNew.lastName,
                                email: userNew.email,
                                country: userNew.country,
                                gender: userNew.gender,
                                userType: userNew.userType,
                                image: userNew.image
                            }
                        });
                    }
                );
            });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    }
}

// @desc Auth user reset password
// @route POST /api/v1/auth/reset-password
exports.userResetPassword = async (req, res, next) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({msg: 'Please enter email'});
        }

        User.findOne({email})
            .then(async (user) => {
                if (!user) return res.status(400).json({msg: 'User does not exist'});

                const characters = '0123456789';
                let activateCode = '';
                for (let i = 0; i < 4; i++) {
                    activateCode += characters[Math.floor(Math.random() * characters.length)];
                }

                const userNew = await Otp.findOneAndUpdate(
                    {userId: user._id},
                    {
                        activateCode: Number(activateCode),
                        numberOfTries: 3,
                        expiredAt: moment().add(30, 'minutes'),
                        updatedAt: moment()
                    },
                    {new: true}
                );

                const msg = {
                    to: email, // Change to your recipient
                    from: {
                        email: 'thelexpulseteam@fadorteclimited.com',
                        name: 'Lexpulse'
                    },
                    subject: 'OTP Verification',
                    // text: 'and easy to do anywhere, even with Node.js',
                    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
          <meta name="viewport" content="width=device-width" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <link href='https://fonts.googleapis.com/css?family=Open Sans' rel='stylesheet'>
          <title>OTP Verification</title>
          
          
          <style type="text/css">
            @font-face {
            font-family: 'Open Sans';
          }
          img {
          max-width: 100%;
          }
          body {
          -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;
          }
          body {
          background-color: #FFFFFF;
          }
          @media only screen and (max-width: 640px) {
            body {
              padding: 0 !important;
            }
            h1 {
              font-weight: 800 !important; margin: 20px 0 5px !important;
            }
            h2 {
              font-weight: 800 !important; margin: 20px 0 5px !important;
            }
            h3 {
              font-weight: 800 !important; margin: 20px 0 5px !important;
            }
            h4 {
              font-weight: 800 !important; margin: 20px 0 5px !important;
            }
            h1 {
              font-size: 22px !important;
            }
            h2 {
              font-size: 18px !important;
            }
            h3 {
              font-size: 16px !important;
            }
            .container {
              padding: 0 !important; width: 100% !important;
            }
            .content {
              padding: 0 !important;
            }
            .content-wrap {
              padding: 10px !important;
            }
            .invoice {
              width: 100% !important;
            }
          }
          </style>
          </head>
          
          <body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #F5F7FB; margin: 0;" bgcolor="#F5F7FB">
          
          <table class="body-wrap" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #F5F7FB; margin: 0;" bgcolor="#F5F7FB"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
              <td class="container" width="600" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
                <div class="content" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
                  <table class="main" width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; border-radius: 8px; background-color: #FFFFFF; margin: 0; border: 8px solid #FFFFFF; box-shadow: 0 2px 21px 0 rgba(0,112,224,0.12);" bgcolor="#FFFFFF"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="alert alert-warning" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; color: #FFFFFF; font-weight: 500; text-align: center; border-radius: 8px 8px 0 0; background-color: #FFFFFF; margin: 0; padding: 20px;" align="center" bgcolor="#FFFFFF" valign="top">
                        <img src="https://res.cloudinary.com/dhfif2kjc/image/upload/v1703946360/logo_muinkl.png" alt="Lexpulse" height="40" width="150" align="left" hspace="5%">
                        <br>
                        <br>
                        <hr width="90%" style="border: solid 0.5px #eaeef6;" >
          
                      </td>
                    </tr><tr align="center" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-wrap" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; padding: 0 20px; color:#25265E;" valign="top">
                        <table width="90%" cellpadding="0" cellspacing="0" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif;  box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;" ><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; padding: 0 0 20px; color:#25265E;" valign="top">
                              Hello ${[user.firstName]},
                            </td>
                          </tr><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; color:#25265E; padding: 0 0 0;" valign="top">
                              Please find your code below. 
                              <br><br> 
                              If you did not perform this request, you can safely ignore this email. Please find your OTP code below. Do not share this code with anyone.
                              <br><br> 
                              <p style="text-align: center; color: #000; font-size: 40px; font-weight: bolder; letter-spacing: 1rem; margin-bottom: 0;">${activateCode}</p>
                            </td>
                          </tr><tr align="center" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0;"><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; padding: 0 0 25px;" valign="top">
                            <br>
                            <br>
                            <hr width="100%" style="border: solid 0.5px #eaeef6;" >
                            </td>
                          </tr><tr align="center" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; padding: 0 0 25px;" valign="top">
                              Have any questions? Email us at: <span style="color:#0070E0; text-decoration: none;">thelexpulseteam@fadorteclimited.com</span>.
                            </td>
                          </tr></table></td>
                    </tr></table><div class="footer" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #25265E; margin: 0; padding: 20px;">
                    <table width="100%" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; margin: 0; color: #25265E;"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; margin: 0; color: #25265E;"><td class="aligncenter content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; vertical-align: top; color: #25265E; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">Copyright © 2024 Lexpulse. All Rights Reserved</td>
                      </tr></table></div></div>
              </td>
              <td style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
            </tr></table></body>
          </html>`,
                };

                // const emailSend = await sgMail.send(msg);

                const emailSend = client.sendEmail({
                    "From": "thelexpulseteam@fadorteclimited.com",
                    "To": email,
                    "Subject": "OTP Verification",
                    "HtmlBody": msg.html,
                    "MessageStream": "outbound"
                });

                return res.status(200).json({
                    success: true,
                    data: userNew
                });
            });

    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    }
}

// @desc Auth user change password
// @route POST /api/v1/auth/change-password
exports.userChangePassword = async (req, res, next) => {
    try {
        const {email, password, confirmPassword} = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({msg: 'Please enter all fields'});
        }

        User.findOne({email})
            .then(async (user) => {
                if (!user) return res.status(400).json({msg: 'User does not exist'});

                // const otpCode = await Otp.findOne({ userId: user.id });

                if (password !== confirmPassword) return res.status(400).json({msg: 'Passwords do not match'});

                // if(moment() > moment(otpCode.expiredAt)) return res.status(400).json({ msg: 'Code expired' });

                // if(otpCode.activateCode !== Number(code)) return res.status(400).json({ msg: 'Invalid code' });

                const salt = await bcrypt.genSalt(10);

                const hash = await bcrypt.hash(password, salt);

                const userNew = await User.updateOne(
                    {_id: user._id},
                    {$set: {password: hash}},
                    {new: true}
                );

                return res.status(200).json({
                    success: true
                });
            });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    }
}