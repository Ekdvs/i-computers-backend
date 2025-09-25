import mongoose from "mongoose"

//create database connection
const connectDB=async()=>{
    if(!process.env.MONGO_URL){
        throw new Error('please defind MONGO_URl variabel inside the .env file')
    }
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Successfull connect to the database')
        
    } catch (error) {
        console.error("Database Connection failed",error)
    }
}

export default connectDB;