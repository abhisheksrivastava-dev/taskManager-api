const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')
const { ObjectId } = require('mongodb')

router.post('/task', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)    
    } catch(e) {
        res.status(400).send(e)
    }
})

// GET /task?completed=true
// GET /task?limit=10&skip=0
// GET /task?sortBy=createdAt_asc for assending
// GET /task?sortBy=createdAt:desc
router.get('/task', auth, async(req,res) => {
    const match = {} 
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        // const task = await Task.find({ owner: req.user._id})

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/task/:id', auth, async (req, res) => {
    const _id = req.params.id
    try{
        const task = await Task.findOne({ _id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    }catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/task/:id', auth, async (req, res) => {
    const Updates = Object.keys(req.body)
    const allowedUpdate = ['decription', 'completed']
    const isValidOperation = Updates.every((update) => allowedUpdate.includes(update))

    if(!isValidOperation){
        res.status(400).send({error: 'Invalid Operation!!!'})
    }
    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }

        Updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
        console.log(e)
    }
})

router.delete('/task/:id', auth, async(req, res) => {
    try{
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    } catch(e){
        res.status(500).send(e)
    }
})

module.exports = router