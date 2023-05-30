const express = require("express")
const app = express()
const port = 3000
const bodyParser = require("body-parser")
const {Toy, Category} = require("./models")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


//CRUD for Categories 
// get all categories
app.get("/categories", async(req, res) => {
    res.send(await Category.findAll())
})

// get specific category
app.get("/categories/:idCategory", async(req, res) => {
    const category = await Category.findByPk(req.params.idCategory);
    if(category){
        res.send(category);
    } else {
        res.sendStatus(404);
    }
})

// create new category
app.post("/categories", async (req, res) => {
    if(req.body.name){
        res.send(await Category.create(req.body))
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
            res.send(await Category.findByPk(category.id))
        } else {
            res.send(category)
        }
    } else {
        res.sendStatus(404)
    }
})

// delete a category
app.delete("/categories/:idCategory", async (req, res) => {
    const category = await Category.findByPk(req.params.idCategory)
    if(category){
        await Category.destroy({where : {id : req.params.idCategory}})
        res.send(category)
    } else {
        res.sendStatus(404)
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
    res.send(toysResponseModels);

}) 

// get specific toy by id
app.get("/toys/:idToy", async(req, res) => {
    const toy = await Toy.findByPk(req.params.idToy)
    if(toy){
        res.send(await createToyResponseModel(toy))
    } else {
        res.sendStatus(404);
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
        res.send(await createToyResponseModel(await Toy.create(toyRelationalModel)))
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

        res.send(await createToyResponseModel(await Toy.findByPk(toy.id)))
    } else {
        res.sendStatus(404)
    }
})

// delete a toy 
app.delete("/toys/:idToy", async(req, res) => {
    const toy = await Toy.findByPk(req.params.idToy)
    if(toy) {
        Toy.destroy({where : { id : req.params.idToy}})
        res.send(await createToyResponseModel(toy))
    } else {
        res.sendStatus(404)
    }
})

// Additional Route: get all the toys of a given category
app.get("/categories/:categName/toys", async(req, res) => {
    const category = await Category.findOne({where : {name : req.params.categName}})
    res.send(await Toy.findAll({where : {category_id : category.id}}))
})


// helper functions
// function to set the category_id for the updated toy 
async function setCategoryId(req, toy) {
    if (req.body.category) {
        const category = await Category.findOne({ where: { name: req.body.category } })
        return category.id
    } else {
        return toy.category_id
    }
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