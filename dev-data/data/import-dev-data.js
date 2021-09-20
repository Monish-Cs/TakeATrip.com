const fs=require('fs');
const Tour=require('./../../models/tourmodels');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config({path: './config.env'})
const db=process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD);
mongoose.connect(db,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=>{
    //console.log(con.connections);
    console.log("DB Connections Successfull");
});

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'));

const importData= async ()=>{
    try{
        await Tour.create(tours);
        console.log("DB Successfully created");
        process.exit();
    }
    catch(err){
        console.log(err);
    }
}

const deleteData= async ()=>{
    try{
        await Tour.deleteMany();
        console.log("DB Successfully deleted");
        process.exit();
    }
    catch(err){
        console.log(err);
    }
}

if(process.argv[2] ==="--import"){
    importData();
}
else if(process.argv[2] ==="--delete"){
    deleteData();
}