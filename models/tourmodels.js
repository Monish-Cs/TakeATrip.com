const mongoose=require('mongoose');
const slugify=require('slugify');
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
        max: [5,'Should be less than 5']
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
    }
},{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});
TourSchema.virtual('durationWeeks').get(function() {
    return this.duration/7;
});
//Document middleware
//only runs for create or save not update
TourSchema.pre('save',function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})
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
TourSchema.pre('aggregate',function(next) {
    this.pipeline().unshift( {$match: { secretTour : {$ne : true}}})
    next();
})
const Tour=mongoose.model('Tour',TourSchema);

module.exports=Tour;