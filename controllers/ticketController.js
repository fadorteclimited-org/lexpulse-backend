const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const moment = require('moment');
const cloudinary = require('../middleware/cloudinary');
var postmark = require("postmark");
var client = new postmark.ServerClient(process.env.POSTMARK_EMAIL_KEY);


// @desc Get all tickets
// @route GET /api/v1/tickets
exports.getTickets = async(req, res, next) => {
    try {
      const tickets =  await Ticket.find();
  
      return res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };


// @desc Get single ticket
// @route GET /api/v1/tickets/:id
exports.getTicket = async(req, res, next) => {
    try {
      const ticket = await Ticket.findById(req.params.id).populate('eventId').populate({ path: 'eventId', populate: { path: 'eventHostId', select: 'firstName lastName'}}).exec();
  
      if(!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Get user tickets
// @route GET /api/v1/tickets/user/:id/:status
exports.getUserTickets = async(req, res, next) => {
    try {
      const today = moment().startOf('day');
      const tickets = await Ticket.find({
        attendeeId: req.params.id,
        status: req.params.status
      }).populate('eventId').populate({
        path: 'eventId',
        populate: {
          path: 'eventHostId',
          select: 'firstName lastName'
        }
      }).exec();

      if (!tickets) {
        return res.status(404).json({
          success: false,
          error: 'Tickets not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

  // @desc Get event tickets
  // @route GET /api/v1/tickets/event/:id
  exports.getEventTickets = async(req, res, next) => {
      try {
        const tickets = await Ticket.find({ eventId: req.params.id });
    
        if(!tickets) {
          return res.status(404).json({
            success: false,
            error: 'Tickets not found'
          });
        }
    
        return res.status(200).json({
          success: true,
          data: tickets
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          error: 'Internal Server Error'
        });
      }
    }

  // @desc Add ticket
  // @route POST /api/v1/tickets
  exports.addTicket = async (req, res, next) => {
    try {

      const tickets = await Ticket.find({ attendeeId: req.body.attendeeId, eventId: req.body.eventId });
  
      if(tickets.length !== 0) {
        return res.status(404).json({
          success: false,
          error: 'Event already booked'
        });
      }

      const event = await Event.findById(req.body.eventId);

      const totalPrice = req.body.ticketInfo.reduce((acc, ticket) => {
        const matchingTicket = event.ticketInfo.find(eventTicket => eventTicket.ticketType === ticket.ticketType);
        return acc + matchingTicket.price * ticket.numberOfTickets;
      }, 0);

      const user = await User.findOne({ _id: req.body.attendeeId });

      const ticket = await Ticket.create({
        eventId: req.body.eventId,
        attendeeId: req.body.attendeeId,
        paymentMethod: req.body.paymentMethod,
        ticketInfo: req.body.ticketInfo,
        totalPrice: totalPrice,
        amountPaid: req.body.amountPaid,
        status: req.body.status
      });

      const msg = {
        to: user.email, // Change to your recipient
        from: {
          email: 'thelexpulseteam@fadorteclimited.com',
          name: 'Lexpulse'
        },
        subject: 'Ticket Booking Successful',
        // text: 'and easy to do anywhere, even with Node.js',
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link href='https://fonts.googleapis.com/css?family=Open Sans' rel='stylesheet'>
        <title>Ticket Booking Successful</title>
        
        
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
                      <img src="https://res.cloudinary.com/dhfif2kjc/image/upload/v1703946360/logo_muinkl.png" alt="Jengaapp" height="40" width="150" align="left" hspace="5%">
                      <br>
                      <br>
                      <hr width="90%" style="border: solid 0.5px #eaeef6;" >
        
                    </td>
                  </tr><tr align="center" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-wrap" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; padding: 0 20px; color:#25265E;" valign="top">
                      <table width="90%" cellpadding="0" cellspacing="0" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; color:#25265E; padding: 0 0 0;" valign="top">
                            Congratulations ${user.firstName}!
                            <br><br>
                            You have successfully booked this event. Below are the details of your order.
                            <br><br>
                            <hr style="border: solid 0.5px #eaeef6;">
                            <br>
                            <b>Ticket Total</b>
                            <br>
                            ${event.currency} ${totalPrice}
                            <br><br>
                            <b>Date</b>
                            <br>
                            ${moment.utc(event.eventDate).local().format('dddd, MMMM DD, YYYY')}
                            <br><br>
                            <b>Venue</b>
                            <br>
                            ${event.location}
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
        "To": user.email,
        "Subject": "Ticket Booking Successful",
        "HtmlBody": msg.html,
        "MessageStream": "outbound"
      });
  
      return res.status(201).json({
        success: true,
        data: ticket
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



// @desc Update single ticket
// @route PATCH /api/v1/tickets/:id
  exports.updateTicket = async(req,res) => {
    try {
      const data = req.body;
  
      const result = await Ticket.findByIdAndUpdate(req.params.id, data, { new: true });
  
      return res.status(201).json({
        success: true,
        data: result
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

  // @desc Delete ticket
  // @route DELETE /api/v1/tickets/:id
  exports.deleteTicket = async(req, res, next) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
  
      if(!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
  
      await ticket.remove();
  
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