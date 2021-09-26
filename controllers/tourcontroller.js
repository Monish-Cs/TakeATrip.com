//const fs=require('fs');
const Tour=require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const Factory = require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.getalltours=Factory.getAll(Tour);
/* exports.getalltours=catchAsync(async (req, res,next) => {
  console.log(req.query);
      const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
      const tours = await features.query;
        res.status(200).send({
            status: "Success",
            result: tours.length,
            tours
        });
}); */
exports.gettour= Factory.getOne(Tour, { path: 'reviews' });
/* exports.gettour=catchAsync(async (req, res,next) => {
  console.log(req.param.id)
        const tour = await Tour.findById(req.params.id).populate('reviews');
        if(!tour){
          return next(new AppError('Tour not Found',404))
        }
        res.status(200).send({
            status: "Success",
            data: {
                tour
            }
        });
        
});
 */
exports.createTour = Factory.createOne(Tour);
/* exports.createTour=catchAsync(async (req, res,next) => {
  const newTour = await Tour.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
      
}); */


exports.updateTour=Factory.updateOne(Tour)
/* exports.updateTour=catchAsync(async (req, res,next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if(!tour){
    return next(new AppError('Tour not Found',404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
      
}); */

exports.deleteTour = Factory.deleteOne(Tour);
/* exports.deleteTour=catchAsync(async (req, res,next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if(!tour){
    return next(new AppError('Tour not Found',404))
  }

  res.status(204).json({
    "status": 'success',
    data: null
  });
    
}); */

exports.gettourstats=catchAsync(async (req,res,next)=>{
  const stats =await Tour.aggregate([
    {
      $match: { ratingsAverage: {$gte : 4.5}}
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty'},
        numTours: { $sum: 1},
        numRatings: { $sum: '$ratingsQuantity'},
        avgRatings: { $avg : '$ratingsAverage'},
        avgPrice: { $avg: '$price'},
        maxPrice: { $max: '$price'},
        minPrice: { $min: '$price'}
      }
    },
    {
      $sort: { avgPrice: -1}
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
exports.getmonth = catchAsync(async (req,res,next)=>{
  const year = req.params.year;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: { 
          startDates:{
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          }
        }
      },
      {
        $group: { 
          _id: { $month: '$startDates'},
          numTours: { $sum: 1},
          names: { $push: '$name'}
        }

      },

      {
        $addFields: { month: '$_id'}
      },
      {
        $project: {
          _id: 0,
        }
      },
      {
        $sort: { 'month': 1}
      },
      {
        $limit: 12
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
});