const mongoose=require('mongoose');
const slugify=require('slugify');
// const User = require('./userModel');
const validator=require('validator');


const TourSchema=new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a number'],
        unique: true,
        trim: true,
        maxlength: [40,'Tour name must have maximum of 40 characters'],
        minlength: [10,'Tour name must have minimum of 10 characters'],
        //validate:[validator.isAlpha,'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty:{
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy','medium','difficult'],
            message: 'Difficulty should be easy or medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1,'Should be greater than 1'],
        max: [5,'Should be less than 5'],
        set: val => Math.round(val*10)/10
    },
    ratingsQuantity:{
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required:[true, 'Tour must have a price']
    },
    discount: {
        type: Number,
        //this does not works in updating
        //only works in inserting new document
        validate: {
            validator: function(val) {
                return val<this.price;
            },
            message: 'Discount price ({VALUE}) Should be less than regulare price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A Tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A Tour must have a description']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String,
          day: Number
        }
    ],
    //guides: Array
    guides: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
    ]
},{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

// tourSchema.index({ price: 1 });
TourSchema.index({ price: 1, ratingsAverage: -1 });
TourSchema.index({ slug: 1 });
TourSchema.index({ startLocation: '2dsphere' });


TourSchema.virtual('durationWeeks').get(function() {
    return this.duration/7;
});

// Virtual populate
TourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
  });


//Document middleware
//only runs for create or save not update
TourSchema.pre('save',function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

TourSchema.pre(/^find/,function(next) {
    this.populate({
        path: 'guides',
        select : "-__v -passwordChangedAt"
    });
    next();
});
//This one is for Embedding User into Tour
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

/* TourSchema.post('save',function(doc,next) {
    console.log(doc);
    next();
}) */

//Query Middleware

//TourSchema.pre('find',function(next) {
TourSchema.pre(/^find/,function(next) {
    this.find( { secretTour : {$ne : true}});
    this.start=Date.now();
    next();
});
TourSchema.post(/^find/,function(docs,next) {
    //console.log(docs);
    console.log(`It took ${Date.now() - this.start} milliseconds`);
    next();
});

//Aggregate Middleware
/* TourSchema.pre('aggregate',function(next) {
    this.pipeline().unshift( {$match: { secretTour : {$ne : true}}})
    next();
}) */
const Tour=mongoose.model('Tour',TourSchema);

module.exports=Tour;