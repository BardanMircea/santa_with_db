const {Category, Toy} = require("./models");

const seed_data = async () => {
    await Category.create({name : 'Videogames'});
    await Category.create({name : 'Boardgames'});
    await Category.create({name : 'Outdoor'});

    await Toy.create({name : "Playstation 4", description : "Famous video game platform", price : 499, category_id: 1})
    await Toy.create({name : "Barbie", description : "Pink doll", price : 29, category_id: null})
    await Toy.create({name : "Monopoly", description: "Board game $$$", price: 59, category_id : 2})
    await Toy.create({name : "Football ball", description : "A ball to play outside", price : 25, category_id: 3})
    await Toy.create({name : "Monopoly", description : "Board game $$$", price : 59, category_id : 2})
}

seed_data();