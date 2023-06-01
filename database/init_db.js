const {Toy, Category, Elf, Wish, Schedule} = require('../models')

const create_tables = async () => {
    await Category.sync({force : true});
    await Toy.sync({force : true});
    await Elf.sync({force : true});
    await Wish.sync({force : true});
    await Schedule.sync({force : true});
}

create_tables()
