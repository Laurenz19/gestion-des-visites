const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUI = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")
const low  = require("lowdb")
const visitorRoutes = require('./src/router/visitor')
const siteRoutes = require('./src/router/site')

//db
const FileSync = require("lowdb/adapters/FileSync")
const adapter = new FileSync("db.json")
const db = low(adapter)
db.defaults({visitors:[], sites:[]}).write()


const app = express()
app.db = db

app.use(cors())
app.use(express.json())
app.use(morgan("dev"))


//routes
app.use('/api/visitors', visitorRoutes)
app.use('/api/sites', siteRoutes)


//swagger documentations configuration
const options = {
    definition:{
        openapi:"3.0.0",
        info: {
            title:"Gestion des visites touristiques",
            version:"1.0.0",
            description: "RestFul Api pour la gestion des visites touristiques"
        },
        servers:[
            { 
                url: "http://localhost:5000",
                description: "Local dev"
            }
        ]
    },
    apis: ["./src/router/*.js"]
}

const specs = swaggerJsDoc(options)
app.use('/swagger', swaggerUI.serve, swaggerUI.setup(specs))


app.listen(5000,()=>{
    console.log('I am listen to you brother')
})