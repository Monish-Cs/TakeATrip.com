const express=require('express');
const tourcontroller=require('./../controllers/tourcontroller');
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRouter');

const router=express.Router();
//router.param('id',tourcontroller.checkid);

router.use('/:tourId/reviews',reviewRouter);

router
    .route("/top-5-cheap")
    .get(tourcontroller.aliasTopTours,tourcontroller.getalltours);
router.route("/tour-stats").get(tourcontroller.gettourstats);
router.route("/tour-months/:year").get(tourcontroller.getmonth);

router.route("/")
    .get(authController.protect,tourcontroller.getalltours)
    .post(tourcontroller.createTour);
router.route("/:id")
    .get(tourcontroller.gettour)
    .patch(tourcontroller.updateTour)
    .delete(authController.protect,authController.requireTo('admin','lead-guide'),tourcontroller.deleteTour);

/* router
    .route('/:tourId/reviews')
    .post(authController.protect,authController.requireTo('user'),reviewController.createReview) */


module.exports=router;