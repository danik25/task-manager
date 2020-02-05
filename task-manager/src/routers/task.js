const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

/**************posts**************/
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

/**************gets**************/

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed == 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        // grabbing the first item in 'parts' array, 
            // and setting it as the name of a property in 'sort'
        sort[parts[0]] = parts[0] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path : 'tasks',
            match,
            options: { 
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
 
        res.send(req.user.tasks)
    } catch(e){
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id // Access the id provided
    
    try{
        const task = await Task.findOne({ _id, owner: req.user._id })
      
        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch(e){
        res.status(500).send()
    }
})

/**************patchers**************/

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation)
    {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try{
        const task = await Task.findOne({_id : req.params.id, owner : req.user._id})

        if(!task)
        {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()

        res.send(task)
    }catch(e){
        res.status(400).send()
    }
    
})

/**************deletes**************/

router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        const task = await Task.findOneAndDelete({_id : req.params.id, owner : req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }

        res.status(200).send(task)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router