//const fs=require('fs');
const Tour=require('./../models/tourmodels');
const APIFeatures=require('./../utils/apiFeatures');
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

/* exports.checkid=(req,res,next,val)=>{
    if(req.params.id*1 > tours.length){
        return res.status(404).json({
            status: 'Failed',
            message: 'Id not found'
        });
    }
    next()
} */
/* exports.checkparam=(req,res,next)=>{
    if(!req.body.name || !req.body.price){
        return res.status(400).send({
            status:"Fail",
            message:"Name or Price is not valid"
        })
    }
    next();
} */
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getalltours=async (req, res) => {
    try{
      console.log(req.query);
      const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
      const tours = await features.query;
        /* //Build Query
        //1) Filtering
        let queryObj={...req.query}
        //console.log(req.query);
        const excludedQuery=['sort','limit','page','fields'];
        excludedQuery.forEach(el => delete queryObj[el]);


        //1A) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(lte|le|gte|gt)\b/g,match=>`$${match}`);

        
        let query=Tour.find(JSON.parse(queryStr));

        //2) Sorting
        if(req.query.sort){
          const sortBy=req.query.sort.split(',').join(' ');
          //console.log(sortBy)
          query=query.sort(sortBy)
        }
        else{
          query=query.sort('-createdAt')
        }

        //3) Fields Limiting
        if(req.query.fields){
          const fields = req.query.fields.split(',').join(' ');
          //console.log(fields);
          query=query.select(fields);
        }
        else{
          query = query.select('-__v');
        }

        //4) Pagination
        const page = req.query.page * 1 || 1;
        const limitt = req.query.limit * 1 || 100;
        const skipp = (page - 1) * limitt;
        query = query.skip(skipp).limit(limitt);
        if(req.query.page){
          const numTours = Tour.countDocuments();
          if(skip>=numTours){
            throw new Error('This page does not exist')
          }
        }


        const tours=await query; */
        res.status(200).send({
            status: "Success",
            result: tours.length,
            tours
        });
        
    }
    catch(err){
        res.status(404).json({
            status: "Fail",
            "message": err
        });
    }
    
}
exports.gettour=async (req, res) => {
    //console.log(req.params);
    //const tour=tours.find(el=>el.id==req.params.id*1);
    try{
        console.log(req.param.id)
        const tour = await Tour.findById(req.params.id);
        res.status(200).send({
            status: "Success",
            data: {
                tour
            }
        });
    }
    catch(err){
        res.status(404).json({
            status: "Fail",
            message: err
        });
    }
}
exports.createTour=async (req, res) => {
    try {
      // const newTour = new Tour({})
      // newTour.save()
  
      const newTour = await Tour.create(req.body);
  
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        "message": err
      });
    }
};

    
    /* console.log(req.body);
    const newid = tours.length;
    const newtours=Object.assign({ id: newid },req.body);
    console.log(newtours);
    tours.push(newtours);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
        res.status(201).send({
            status: "Sucess",
            data: {newtours}
        })
    }) */
//}
exports.updateTour=async (req, res) => {
    try {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
  
      res.status(200).json({
        status: 'success',
        data: {
          tour
        }
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };
exports.deleteTour=async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      "status": 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.gettourstats=async (req,res)=>{
  try{
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

  }catch(err){
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
exports.getmonth = async (req,res)=>{
  try{
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

  }catch(err){
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
}