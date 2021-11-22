const AppError = require('../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const Factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

/* const multerStorage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null, 'public/img/users')
  },
  filename: (req,file,cb)=>{
    // user-3235235-343343.jpeg
    const ext = file.mimetype.split('/')[1]
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  }
}); */

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) =>{
  if(file.mimetype.startsWith('image')) {
    cb(null,true);
  } else {
    cb(new AppError('Not an image! Please upload only images.',400),false);
  }

}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }
  
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename;
  
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  });


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
  
    res.status(204).json({
      status: 'success',
      data: null
    });
});
exports.getMe = (req,res,next)=> {
  req.params.id = req.user.id;
  next();
}

exports.getAllUsers = Factory.getAll(User);
exports.getuser = Factory.getOne(User);

exports.createuser=(req,res)=>{
    res.status(500).send({
        status: "error",
        message: "Server not yet defined, Please Signup to create"
    });
}

exports.updateuser = Factory.updateOne(User)
//Do not update password

exports.deleteuser = Factory.deleteOne(User);