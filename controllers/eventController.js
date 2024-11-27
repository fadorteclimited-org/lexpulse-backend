const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const cloudinary = require('../middleware/cloudinary');



// @desc Get all events
// @route GET /api/v1/events
exports.getEvents = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = {
      approved: true,
      country: req.query.country,
      eventDate: { $gte: today },
    };

    if (req.query.search) {
      query.eventName = { $regex: new RegExp(req.query.search, 'i') };
    }

    const pageSize = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * pageSize;

    const events = await Event.find(query)
        .sort({ eventDate: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({ path: 'eventHostId', select: '_id firstName lastName image' })
        .exec();

    const totalEvents = await Event.countDocuments(query);
    const hasMore = skip + events.length < totalEvents;

    return res.status(200).json({
      success: true,
      data: events,
      hasMore,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

// @desc Get single event
// @route GET /api/v1/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('scanners');
    const ticket = await Ticket.countDocuments({ eventId: req.params.id });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        event,
        tickets: ticket,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};


// @desc Get user events
// @route GET /api/v1/events/user/:id
exports.getUserEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ eventHostId: req.params.id }).populate({path: 'scanners'});

    if (!events) {
      return res.status(404).json({
        success: false,
        error: 'Events not found',
      });
    }

    const eventsWithRevenue = await Promise.all(events.map(async (event) => {
      const revenueData = await Ticket.aggregate([
        { $match: { eventId: event._id } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
      ]);

      const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
      return { ...event.toObject(), revenue };  // Combine event data with calculated revenue
    }));
    return res.status(200).json({
      success: true,
      data: eventsWithRevenue
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

// @desc Add event
// @route POST /api/v1/events
exports.addEvent = async (req, res, next) => {
  try {
    const result = async (path) => await cloudinary.uploader.upload(path);



    const files = req.files;

    const poster = await result(files['poster'][0].path);
    const cover = await result(files['cover'][0].path);
    const imageUrls = [poster.secure_url,cover.secure_url];

    if (files['image'] && files['image'].length > 0) {
      for (const file of files) {
        const { path } = file;

        const newPath = await result(path);
        imageUrls.push(newPath.secure_url);
      }
    }

    const venue = req.body.venue;
    venue.saved = (req.body.saved === 'true');
    const _event ={
      eventHostId: req.body.eventHostId,
      poster: poster.secure_url,
      cover: cover.secure_url,
      eventName: req.body.eventName,
      location: req.body.location,
      country: req.body.country,
      category: req.body.category,
      // subCategory: req.body.subCategory,
      currency: req.body.currency,
      ticketInfo: req.body.ticketInfo,
      eventDate: req.body.eventDate,
      eventEnd: req.body.eventEnd, // New field
      startSalesDate: req.body.startSalesDate, // New field
      endSalesDate: req.body.endSalesDate, // New field
      image: imageUrls,
      description: req.body.description,
      minAge: req.body.minAge, // New field
      dress: req.body.dress, // New field
      venue: venue, // New venue details
      lastEntry: req.body.lastEntry,
      approved: false,
    };

    const event = await Event.create(_event);

    return res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
      });
    }
  }
};


// @desc Update event
// @route PATCH /api/v1/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const result = async (path) => await cloudinary.uploader.upload(path);

    const imageUrls = [];

    const files = req.files;

    if (files && files.length > 0) {
      for (const file of files) {
        const { path } = file;
        const newPath = await result(path);
        imageUrls.push(newPath.secure_url);
      }
    }

    const updatedData = {
      ...req.body, // Includes new fields like eventEnd, startSalesDate, minAge, dress, venue
      image: imageUrls.length > 0 ? imageUrls : undefined,
    };

    const event = await Event.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
      });
    }
  }
};


// @desc Delete event
// @route DELETE /api/v1/events/:id
exports.deleteEvent = async(req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if(!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    await event.remove();

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



// @route Post /api/v1/approve/:id
exports.approveEvent = async(req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    event.approved = true;
    await event.save();

    return res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}