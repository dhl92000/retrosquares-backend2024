const { Sequelize, DataTypes } = require('sequelize')
// Connect to db with Sequelize instance
const sequelize = new Sequelize('retrosq_squares', 'root', process.env.MYSQL_PASSWORD, {
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
    squares_description: DataTypes.STRING,
    img_url: DataTypes.STRING,
    hashtags: {
        type: DataTypes.STRING
    }
}
)

// ASSOCIATIONS
User.hasMany(Square)
Square.belongsTo(User)

// Function to sync/overwrite existing db
// const modelSync = async () => {
//     await sequelize.sync({ force: true });
//  }

// modelSync()


module.exports = { User, Square }

