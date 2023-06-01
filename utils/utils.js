const {Category, Elf, Schedule} = require("../models")
const bcrypt = require("bcrypt");                                    // using bcrypt instead of MD5 as a hashing algorithm
const { Op } = require("sequelize")


// helper functions
// middleware function to check the login is and remains unique for each Elf at Create or Update (enforcing a unique login to make password checking easier)
async function checkUniqueLogin(req, res, next) {
    if(req.body.login && req.params.idElf){                                                  // handle the Update scenario
        if(await Elf.findOne({where : {[Op.and] : [{login : req.body.login}, {id : {[Op.ne] : req.params.idElf}}]}})){
            res.status(422).send("[login] already in use: Please pick a different [login]")
        } else {
            next()
        }
    } else if (req.body.login){                                      // handle the Create scenario
        if(await Elf.findOne({where : {login : req.body.login}})){
            res.status(422).send("[login] already in use: Please pick a different [login]")
        } else {
            next()
        }
    }
}

// middleware function to check that [login] and [password] query params are present when getting the Schedules for a specific Elf
function checkForQueryParams(req, res, next) {
    if(req.query.login && req.query.password){
        next()
    } else {
        res.status(404).send("Missing expected query params [login] and/or [password]")
    }
}

// function to create a new Schedule entry with a random Elf assigned to handle the newly created Wish
async function createNewSchedule(count, newWish) {
    return await Schedule.create({
        elf_id: count > 0 ? Math.floor(Math.random() * count) + 1 : null,
        wish_id: newWish.id,
        done: false,
        done_at: null
    })
}

// middleware function to check all attributes are present at Wish creation
function checkWishAttributes(req, res, next){
    if(req.body.childName && req.body.toy) {
        next()
    } else {
        res.sendStatus(422)
    }
}

// function to set password for Elf at update
function setPassword(updatedPassword, currentPassword) {
    if(updatedPassword) {
        return hashPassword(updatedPassword)
    } 
        
    return currentPassword
}

// middleware function to check that all attributes are provided for Elf insert and update operations
function checkElfAttributes(req, res, next) {
    if(req.body.firstName && req.body.lastName && req.body.login && req.body.password){
        next()
    } else {
        res.sendStatus(422)
    }
}

// function to hash the plain text password, in order to store it securely in the DB Elves table
function hashPassword(password) {
    return bcrypt.hashSync(password, 8);   
}

// function to set the category_id for the updated Toy 
async function setCategoryId(req, toy) {
    if (req.body.category) {
        const category = await Category.findOne({ where: { name: req.body.category } })
        if(category) {
            return category.id
        } 
    } 
    return toy.category_id
}

// function to shape the Toy relational model into the expected response model
async function createToyResponseModel(toyRelationalModel){
    let toyResponseModel = {};

    toyResponseModel.id = toyRelationalModel.id
    const category = await Category.findByPk(toyRelationalModel.category_id)
    toyResponseModel.category = category === null ? null : category.name
    toyResponseModel.description = toyRelationalModel.description
    toyResponseModel.name = toyRelationalModel.name
    toyResponseModel.price = toyRelationalModel.price

    return toyResponseModel;
} 

// function to shape the Toy request model for insertion in the DB
function createToyRelationalModel(toyRequestModel, category){
    let toyRelationalModel = {}

    toyRelationalModel.name = toyRequestModel.name
    toyRelationalModel.description = toyRequestModel.description;
    toyRelationalModel.price = toyRequestModel.price
    toyRelationalModel.category_id = category.id

    return toyRelationalModel
}


module.exports = {createToyRelationalModel, 
    createToyResponseModel, 
    setCategoryId, 
    hashPassword, 
    checkElfAttributes, 
    setPassword, 
    checkWishAttributes,
    createNewSchedule,
    checkForQueryParams,
    checkUniqueLogin
}