const express = require('express')
const User = require('../models/user')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const auth = require('../middleware/auth')

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try{
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user, token})
    } catch(e) {
        console.log('i am here in catch',e)
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
        // res.send(user)
    }catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth,  async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name','password','email','age']
    const isValidOperation = updates.every((update)=> allowedUpdate.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!!!'})
    }

    try{
        // const user = await User.findById(req.user._id)

        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        // if(!user)
        // {
        //     return res.status(404).send()
        // }
        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     res.status(404).send()
        // }
        await req.user.delete()
        res.send(req.user)
    }catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(PNG|jpg|jpeg)$/)){
            return cb(new Error('Please Upload a Images'))
        }

        cb(undefined, true)

        // cb(new Error('File must be PDF'))
        // cb(undefined, true)
        // cb(undefined, false)
    }
})

router.post('/users/me/avatar', auth,  upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
    req.user.avatar = buffer 
    await req.user.save()
    res.send()
}, (error, req, res, next)=> {
    res.status(400).send({ error: error.message})
})

router.delete('/users/me/avatar', auth, async(req, res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send(req.user)
})

router.get('/users/:id/avatar', async(req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error('Either User or Avatar is not present')
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch(e){
        res.status(400).send()
    }
})


module.exports = router