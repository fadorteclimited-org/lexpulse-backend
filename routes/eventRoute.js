const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    getEvents, getEvent, getUserEvents, addEvent, updateEvent, deleteEvent
} = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');
const {getUpcomingEvents, getPopularEvents, getPromotedEvents, getCategoryEvents, updateViewCounts, searchEvents} = require("../controllers/eventControllerEXT");


router
    .route('/')
    .get(auth, getEvents)
    .post(auth, upload.fields([
        {name: 'image', maxCount: 5},
        {name: 'poster', maxCount: 1},
        {name: 'cover', maxCount: 1},
    ]), addEvent);

router
    .route('/upcoming').get(getUpcomingEvents);
router.route('/popular').get(getPopularEvents);
router.route('/featured').get(getPromotedEvents);
router.route('/category/:category').get(getCategoryEvents);

router.route('/views').post(updateViewCounts)
router.route('/search').get(searchEvents)

router
    .route('/:id')
    .get(getEvent)
    .patch(auth, upload.array("image"), updateEvent)
    .delete(auth, deleteEvent);

router
    .route('/user/:id')
    .get(auth, getUserEvents);

module.exports = router;