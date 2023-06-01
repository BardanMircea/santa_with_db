const { Category } = require("../models");
const express = require("express")
const category_router = express.Router()

// CRUD for Categories 
// get all categories
category_router.get("/", async (req, res) => {
    res.json(await Category.findAll());
});
// get specific category
category_router.get("/:idCategory", async (req, res) => {
    const category = await Category.findByPk(req.params.idCategory);
    if (category) {
        res.json(category);
    } else {
        res.status(404).send("Category not found");
    }
});
// create new category
category_router.post("/", async (req, res) => {
    if (req.body.name) {
        res.json(await Category.create(req.body));
    } else {
        res.sendStatus(422);
    }
});
// update a category
category_router.put("/:idCategory", async (req, res) => {
    const category = await Category.findByPk(req.params.idCategory);
    if (category) {
        if (req.body.name) {
            await Category.update({ name: req.body.name }, { where: { id: category.id } });
            res.json(await Category.findByPk(category.id));
        } else {
            res.json(category);
        }
    } else {
        res.status(404).send("Category not found");
    }
});
// delete a category
category_router.delete("/:idCategory", async (req, res) => {
    const category = await Category.findByPk(req.params.idCategory);
    if (category) {
        await Category.destroy({ where: { id: category.id } });
        res.json(category);
    } else {
        res.status(404).send("Category not found");
    }
});
// Additional Route: get all the toys of a given category
category_router.get("/:categName/toys", async (req, res) => {
    const category = await Category.findOne({ where: { name: req.params.categName } });
    if (category) {
        const toysOfCategory = await Toy.findAll({ where: { category_id: category.id } });
        const toysOfCategoryModeled = [];
        for (const toy of toysOfCategory) {
            toysOfCategoryModeled.push(await createToyResponseModel(toy));
        }
        res.json(toysOfCategoryModeled);
    } else {
        res.status(404).send("Category not found");
    }
});

module.exports = {category_router};
