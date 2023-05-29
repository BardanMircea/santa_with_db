const {Toy, Category} = require('./models')

const create_tables = async () => {
    await Category.sync({force : true});
    await Toy.sync({force : true});
}

create_tables()
