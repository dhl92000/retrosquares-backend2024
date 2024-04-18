const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

// Connect to db with Sequelize instance
const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql'
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

const User = db.sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    }
})

const Square = sequelize.define('Square', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    keyName: DataTypes.STRING,
    squares_description: DataTypes.STRING,
    img_url: DataTypes.STRING
}
)

const Hashtag = sequelize.define('Hashtag', {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    hashtag: DataTypes.STRING

})

// ASSOCIATIONS
User.hasMany(Square)
Square.belongsTo(User)
Square.belongsToMany(Hashtag, {through: 'SquareHashtag'})
Hashtag.belongsToMany(Square, { through: 'SquareHashtag'})

// Function to sync/overwrite existing db
const modelSync = async () => {
    await sequelize.sync({ force: true });
    console.log("models synced!")
 }

//modelSync()


module.exports = { User, Square, Hashtag }

