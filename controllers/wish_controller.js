const { Toy, Elf, Wish } = require("../models");
const { checkWishAttributes, createNewSchedule } = require("../utils/utils");
const express = require("express")
const wish_router = express.Router()

// CRUD (GET all and POST) for Wishes
// get all wishes
wish_router.get("/", async (req, res) => {
    res.json(await Wish.findAll());
});
// create a wish
wish_router.post("/", checkWishAttributes, async (req, res) => {
    const toy = await Toy.findOne({ where: { name: req.body.toy } });
    if (toy) {
        const newWish = await Wish.create({
            childName: req.body.childName,
            toy_id: toy.id
        });

        // create a new Schedule
        const { count } = await Elf.findAndCountAll(); // get the total number of elves in the DB table 
        await createNewSchedule(count, newWish);

        res.json(newWish);

    } else {
        res.status(422).send("Unprocessable request ( Missing attribute : couldn't find a Toy with that name in Santa's workshop )");
    }
});

module.exports = {wish_router}