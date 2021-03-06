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
router.route("/tour-months/:year").get(authController.protect,authController.requireTo('admin','lead-guide','guide'),tourcontroller.getmonth);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourcontroller.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourcontroller.getDistances);

router.route("/")
    .get(tourcontroller.getalltours)
    .post(authController.protect,authController.requireTo('admin','lead-guide'),tourcontroller.createTour);
router.route("/:id")
    .get(tourcontroller.gettour)
    .patch(authController.protect,authController.requireTo('admin','lead-guide'),tourcontroller.uploadTourImages,tourcontroller.resizeTourImages,tourcontroller.updateTour)
    .delete(authController.protect,authController.requireTo('admin','lead-guide'),tourcontroller.deleteTour);

/* router
    .route('/:tourId/reviews')
    .post(authController.protect,authController.requireTo('user'),reviewController.createReview) */


module.exports=router;