const User = require('../models/userModel');
const Points = require('../models/pointsModel');
const Otp = require('../models/otpModel');
const Following = require('../models/followingModel');
const ReferralCode = require('../models/referralCodeModel');
const shortid = require('shortid');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../middleware/cloudinary');
var postmark = require("postmark");
var client = new postmark.ServerClient(process.env.POSTMARK_EMAIL_KEY);

// @desc Get all users
// @route GET /api/v1/users
exports.getUsers = async(req, res, next) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

// @desc Get single user
// @route GET /api/v1/users/:id
exports.getUser = async(req, res, next) => {
  try {
    const users = await User.findById(req.params.id);
    const points = await Points.findOne({ userId: req.params.id });
    const following = await Following.findOne({ userId: req.params.id });
    const referralCode = await ReferralCode.findOne({ userId: req.params.id });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          image: users.image
        },
        points,
        following,
        referralCode
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

// @desc Add user
// @route POST /api/v1/users
exports.addUser = async(req, res, next) => {
  try {
    const { firstName, lastName, email, username, country, password, userType } = req.body;

    if(!firstName || !lastName || !email || !username || !country || !password || !userType) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const characters = '123456789';
    let activateCode = '';
    for (let i = 0; i < 4; i++) {
      activateCode += characters[Math.floor(Math.random() * characters.length )];
    };

    // Image upload
    const result = async(path) => await cloudinary.uploader.upload(path);

    const imageUrls = [];

    const files = req.files;

    if(files && (files.length > 0)) {
      for (const file of files) {
        const { path } = file;
  
        const newPath = await result(path);
  
        imageUrls.push(newPath.secure_url);
      }
    }

    User.findOne({ $or: [
      { email },
      { username }
    ] })
    // User.findOne({ email })
      .then(async (user) => {
        if(user && user.username && user.username === username) {
          return res.status(400).json({ msg: 'Username already exists' });
        }

        if(user && user.activatedEmail === false) {
          return res.status(201).json({ success: true });
        }

        const salt = await bcrypt.genSalt(10);

        const hash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
          firstName,
          lastName,
          email,
          username,
          country,
          password: hash,
          // gender,
          phone: Number(activateCode),
          //TODO: Change for production
          activatedEmail: true,
          activatedPhone: false,
          userType,
          accountActive: true,
          image: imageUrls
        });

        const point = await Points.create({
          userId: newUser.id,
          newBalance: 0,
          previousBalance: 0
        });

        const otp = await Otp.create({
          userId: newUser.id,
          activateCode: Number(activateCode),
          numberOfTries: 3,
          expiredAt: moment().add(30, 'minutes'),
          updatedAt: moment()
        });

        const following = await Following.create({
          userId: newUser.id,
          followers: [],
          following: []
        });

        const ReferralCodeSchema = await ReferralCode.create({
          userId: newUser.id,
          code: shortid.generate()
        });
        
        const msg = {
          to: email, // Change to your recipient
          from: {
            email: 'thelexpulseteam@fadorteclimited.com',
            name: 'Lexpulse'
          },
          subject: 'One Time PIN Registration',
          // text: 'and easy to do anywhere, even with Node.js',
          html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
          <meta name="viewport" content="width=device-width" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <link href='https://fonts.googleapis.com/css?family=Open Sans' rel='stylesheet'>
          <title>Confirm Email</title>
          
          
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
                              Hello ${newUser.firstName},
                            </td>
                          </tr><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; color:#25265E; padding: 0 0 0;" valign="top">
                              Thank you for signing up for Lexpulse.
                              <br><br> 
                              Below is your verification code. Do not share this code with anyone.
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
          "Subject": "One Time PIN Registration",
          "HtmlBody": msg.html,
          "MessageStream": "outbound"
        });

        return res.status(201).json({
          success: true
        });

        /* jwt.sign(
          { id: newUser.id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' },
          (err, token) => {
            if(err) throw err;

            res.json({
              token,
              user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                country: newUser.country,
                gender: newUser.gender,
                userType: newUser.userType,
                image: newUser.image
              }
            });
          }
        ); */
      });

  } catch (error) {
    if(error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    else {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }
}

// @desc Update user
// @route Patch /api/v1/users/:id
exports.updateUser = async(req,res) => {
  try {
    const data = req.body;
    const result = async(path) => await cloudinary.uploader.upload(path);

    const imageUrls = [];

    const files = req.files;

    if(files && (files.length > 0)) {
      for (const file of files) {
        const { path } = file;
  
        const newPath = await result(path);
  
        imageUrls.push(newPath.secure_url);
      };

      data["image"] = imageUrls;
    }

    const result1 = await User.findByIdAndUpdate(req.params.id, data, { new: true });

    return res.status(201).json({
      success: true,
      user: result1
    });
  } catch (error) {
    console.log(error);
    if(error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    else {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }
}

// @desc Delete user
// @route DELETE /api/v1/users/:id
exports.deleteUser = async(req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if(!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.remove();

    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}
