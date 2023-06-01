const { Toy, Category } = require("../models");
const { createToyRelationalModel, createToyResponseModel, setCategoryId } = require("../utils/utils");
const express = require("express")
const toy_router = express.Router();

// CRUD for Toys
// get all toys
toy_router.get("/", async (req, res) => {
    const toys = await Toy.findAll();
    const toysResponseModels = [];
    for (const toy of toys) {
        toysResponseModels.push(await createToyResponseModel(toy));
    }
    res.json(toysResponseModels);

});
// get specific toy by id
toy_router.get("/:idToy", async (req, res) => {
    const toy = await Toy.findByPk(req.params.idToy);
    if (toy) {
        res.json(await createToyResponseModel(toy));
    } else {
        res.status(404).send("Toy not found");
    }
});
// create new toy
toy_router.post("/", async (req, res) => {
    if (req.body.name && req.body.description && req.body.price && req.body.category) { // category contains the name of the category
        // to find the id for the category, we need to query the DB for the whole entry and extract it from there
        const category = await Category.findOne({ where: { name: req.body.category } });
        // we need to build the toy for insertion in the BD, with the required fields 
        let toyRelationalModel = createToyRelationalModel(req.body, category);
        // finally, build and save the toy to our DB, then return the response model for the created toy to the client 
        res.json(await createToyResponseModel(await Toy.create(toyRelationalModel)));
    } else {
        res.sendStatus(422);
    }
});
// update a toy
toy_router.put("/:idToy", async (req, res) => {
    const toy = await Toy.findByPk(req.params.idToy);
    if (toy) {
        const categoryId = await setCategoryId(req, toy);
        await Toy.update({
            name: req.body.name ? req.body.name : toy.name,
            description: req.body.description ? req.body.description : toy.description,
            price: req.body.price ? req.body.price : toy.price,
            category_id: categoryId
        }, { where: { id: toy.id } });

        res.json(await createToyResponseModel(await Toy.findByPk(toy.id)));
    } else {
        res.status(404).send("Toy not found");
    }
});
// delete a toy 
toy_router.delete("/:idToy", async (req, res) => {
    const toy = await Toy.findByPk(req.params.idToy);
    if (toy) {
        await Toy.destroy({ where: { id: toy.id } });
        res.json(await createToyResponseModel(toy));
    } else {
        res.status(404).send("Toy not found");
    }
});

module.exports = {toy_router}