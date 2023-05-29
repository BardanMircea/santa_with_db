const Sequelize = require('sequelize');

const db = new Sequelize ({
    database : 'santas_magical_world',
    username: 'postgres',
    password: "hello" , // This must be a non-empty String, else Postgres throws a fit, no idea why as of yet
    host: 'localhost',
    port: '5432',
    dialect: 'postgres'
});

const Toy = db.define('Toy', {
    name : {type : Sequelize.STRING },
    description : {type : Sequelize.TEXT},
    price : {type : Sequelize.INTEGER},
    // category_id : {type : Sequelize.INTEGER}
}, {
    timestamps : false                             // to prevent creation of the "credatedAt" and "updatedAt" columns
});

const Category = db.define('Category', {
    name : {type : Sequelize.STRING}
}, {
    timestamps : false
});

const Elf = db.define("Elf", {
    firstName : {type : Sequelize.STRING},
    lastName : {type : Sequelize.STRING},
    login : {type : Sequelize.STRING},
    password : {type : Sequelize.STRING}
}, {
    timestamps : false
})

Category.hasMany(Toy, {foreignKey : "category_id"}); 
Toy.belongsTo(Category, {foreignKey : "category_id"});


module.exports = {db, Toy, Category};
