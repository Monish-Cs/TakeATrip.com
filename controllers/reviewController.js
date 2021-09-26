const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const Factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req,res,next)=>{
    let filter ={}
    if(req.params.tourId) filter = {tour: req.params.tourId}
    const reviews =await Review.find(filter);

    res.status(200).json({
        status: "Success",
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.setTourUserIds = (req,res,next) => {
    //Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}


exports.createReview = Factory.createOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.deleteReview = Factory.deleteOne(Review);