// REST API or Restful API :- Representational State Transfer - Application Programming interface 

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})


// const Task = mongoose.model('Task', {
//     decription: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })

// const task = new Task({
//     decription: '   Mongoose libary    ',
    
// })

// task.save().then(() => {
//     console.log(task)
// }).catch((error) => {
//     console.log(error)
// })