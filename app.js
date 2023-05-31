const express = require("express")
const app = express()
const port = 3000
const bodyParser = require("body-parser")
const {Toy, Category, Elf, Wish, Schedule} = require("./models")
const bcrypt = require("bcrypt");                                    // using bcrypt instead of MD5 as a hashing algorithm

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


// CRUD for Categories 
// get all categories
app.get("/categories", async(req, res) => {
    res.json(await Category.findAll())
})

// get specific category
app.get("/categories/:idCategory", async(req, res) => {
    const category = await Category.findByPk(req.params.idCategory);
    if(category){
        res.json(category);
    } else {
        res.status(404).send("Category not found")
    }
})

// create new category
app.post("/categories", async (req, res) => {
    if(req.body.name){
        res.json(await Category.create(req.body))
    } else {
        res.sendStatus(422);
    }
})

// update a category
app.put("/categories/:idCategory", async (req, res) => {
    const category = await Category.findByPk(req.params.idCategory) 
    if(category){
        if(req.body.name){
            await Category.update({name : req.body.name}, { where : {id : category.id}})
            res.json(await Category.findByPk(category.id))
        } else {
            res.json(category)
        }
    } else {
        res.status(404).send("Category not found")
    }
})

// delete a category
app.delete("/categories/:idCategory", async (req, res) => {
    const category = await Category.findByPk(req.params.idCategory)
    if(category){
        await Category.destroy({where : {id : category.id}})
        res.json(category)
    } else {
        res.status(404).send("Category not found")
    }
})


// CRUD for Toys
// get all toys
app.get("/toys", async(req, res) => {
    const toys = await Toy.findAll();
    const toysResponseModels = []
    for(const toy of toys){
        toysResponseModels.push(await createToyResponseModel(toy))
    }
    res.json(toysResponseModels);

}) 

// get specific toy by id
app.get("/toys/:idToy", async(req, res) => {
    const toy = await Toy.findByPk(req.params.idToy)
    if(toy){
        res.json(await createToyResponseModel(toy))
    } else {
        res.status(404).send("Toy not found")
    }
})

// create new toy
app.post("/toys", async(req, res) => {
    if(req.body.name && req.body.description && req.body.price && req.body.category){               // category contains the name of the category
        // to find the id for the category, we need to query the DB for the whole entry and extract it from there
        const category = await Category.findOne({where : { name : req.body.category}})
        // we need to build the toy for insertion in the BD, with the required fields 
        let toyRelationalModel = createToyRelationalModel(req.body, category);
        // finally, build and save the toy to our DB, then return the response model for the created toy to the client 
        res.json(await createToyResponseModel(await Toy.create(toyRelationalModel)))
    } else {
        res.sendStatus(422)
    }
})

// update a toy
app.put("/toys/:idToy", async(req, res) => {
    const toy = await Toy.findByPk(req.params.idToy)
    if(toy) {
        const categoryId = await setCategoryId(req, toy)
        await Toy.update({
            name : req.body.name ? req.body.name : toy.name,
            description : req.body.description ? req.body.description : toy.description,
            price : req.body.price ? req.body.price : toy.price,
            category_id : categoryId
        }, {where : {id : toy.id}})

        res.json(await createToyResponseModel(await Toy.findByPk(toy.id)))
    } else {
        res.status(404).send("Toy not found")
    }
})

// delete a toy 
app.delete("/toys/:idToy", async(req, res) => {
    const toy = await Toy.findByPk(req.params.idToy)
    if(toy) {
        await Toy.destroy({where : { id : toy.id}})
        res.json(await createToyResponseModel(toy))
    } else {
        res.status(404).send("Toy not found")
    }
})

// Additional Route: get all the toys of a given category
app.get("/categories/:categName/toys", async(req, res) => {
    const category = await Category.findOne({where : {name : req.params.categName}})
    if(category) {
        const toysOfCategory = await Toy.findAll({where : {category_id : category.id}})
        const toysOfCategoryModeled = []
        for(const toy of toysOfCategory){
            toysOfCategoryModeled.push(await createToyResponseModel(toy))
        }
        res.json(toysOfCategoryModeled)
    } else {
        res.status(404).send("Category not found")
    }
})


// CRUD for Elves
// get all elves
app.get("/elves", async (req, res) =>{
    res.json(await Elf.findAll())
})

// get a specific elf by id
app.get("/elves/:idElf", async (req, res) => {
    const elf = await Elf.findByPk(req.params.idElf)
    if(elf){    
        res.json(elf)
    } else {
        res.status(404).send("Elf not found")
    }
})

// create new elf
app.post("/elves", checkElfAttributes, async (req, res) => {
    req.body.password = hashPassword(req.body.password);
    res.json(await Elf.create(req.body))
})

// update an elf
app.put("/elves/:idElf", async(req, res) => {
    const elf = await Elf.findByPk(req.params.idElf)
    if(elf){
        const password = setPassword(req.body.password, elf.password)
        await Elf.update({
            firstName : req.body.firstName ? req.body.firstName : elf.firstName,
            lastName : req.body.lastName ? req.body.lastName : elf.lastName,
            login : req.body.login ? req.body.login : elf.login,
            password : password
        }, {where : {id : elf.id}})
        res.json(await Elf.findByPk(elf.id))
    } else {
        res.status(404).send("Elf not found")
    }
})

// delete an elf
app.delete("/elves/:idElf", async (req, res) => {
    const elf = await Elf.findByPk(req.params.idElf)
    if(elf){
        await Elf.destroy({where : {id : elf.id}})
        res.json(elf)
    } else {
        res.status(404).send("Elf not found")
    }
}) 


// CRUD (GET all and POST) for Wishes
// get all wishes
app.get("/wishes", async(req, res) => {
    res.json(await Wish.findAll())
})

// create a wish
app.post("/wishes", checkWishAttributes, async (req, res) =>{
    const toy = await Toy.findOne({where : {name : req.body.toy}})
    if(toy) {
        const newWish = await Wish.create({
            childName : req.body.childName,
            toy_id : toy.id
        })

        // create a new Schedule
        const {count} = await Elf.findAndCountAll()   // get the total number of elves in the DB table 
        await createNewSchedule(count, newWish)    

        res.json(newWish)
            
    } else {
        res.status(422).send("Unprocessable request ( Missing attribute : couldn't find a Toy with that name in Santa's workshop )")
    }
})


// CRUD (GET and update) for Schedules
// get all schedule entries for a specific elf
app.get("/schedules", checkForQueryParams, async(req, res) => {
    const elves = await Elf.findAll({where : {login : req.query.login}}) 

    if(elves.length){
        for(const elf of elves){
            if(bcrypt.compareSync(req.query.password, elf.password)){
                res.json(await Schedule.findAll({where : {elf_id : elf.id}}));
                return;
            }
        }
    }    
    res.status(404).send("Elf not found")
    
})

// update a Schedule (mark as done)
app.put("/schedules/:idSchedule/done", async(req, res) => {
    const schedule = await Schedule.findByPk(req.params.idSchedule);

    if(schedule && !schedule.done) {
        await Schedule.update({done : true, done_at : new Date()}, {where : {id : schedule.id}})
        res.json(await Schedule.findByPk(schedule.id) )
    } else {
        res.status(404).send(schedule ? "Scheduled task is already done" : "Schedule not found")
    }
})


// helper functions
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

// middleware function to check all attributes are present at wish creation
function checkWishAttributes(req, res, next){
    if(req.body.childName && req.body.toy) {
        next()
    } else {
        res.sendStatus(422)
    }
}

// function to set password for elf at update
function setPassword(updatedPassword, currentPassword) {
    if(updatedPassword) {
        return hashPassword(updatedPassword)
    } 
        
    return currentPassword
}

// middleware function to check that all attributes are provided for elf insert and update operations
function checkElfAttributes(req, res, next) {
    if(req.body.firstName && req.body.lastName && req.body.login && req.body.password){
        next()
    } else {
        res.sendStatus(422)
    }
}

// function to hash the plain text password to store it securely in the DB elves table
function hashPassword(password) {
    return bcrypt.hashSync(password, 8);   
}

// function to set the category_id for the updated toy 
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


// start the server
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})