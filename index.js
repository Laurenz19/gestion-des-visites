const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUI = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")
const low  = require("lowdb")
const visitorRoutes = require('./src/router/visitor')
const siteRoutes = require('./src/router/site')
const visitRoutes = require('./src/router/visit')
const authRoutes = require('./src/router/authentication')
require('dotenv').config();



//db
const FileSync = require("lowdb/adapters/FileSync")
const adapter = new FileSync("db.json")
const db = low(adapter)
db.defaults({
  visitors:[],
  _visitors:[{"nb":0}],
  sites:[],
  _sites:[{"nb":0}],
  visits:[],
  _visits:[{"nb":0}],
  users:[],
  _users:[{"nb":0}]
}).write()


const app = express()
app.db = db

app.use(cors({
  credentials: true,
  origin: ['http://localhost:5000']
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan("dev"))


//routes
app.use('/api',authRoutes);
app.use('/api/visitors', visitorRoutes)
app.use('/api/sites', siteRoutes)
app.use('/api/visits', visitRoutes)


//swagger documentations configuration
const options = {
    definition:{
        openapi:"3.0.0",
        info: {
            title:"Ketrika API",
            version:"2.0.0",
            description: "RestFul Api pour la gestion des visites touristiques",
            contact: {
              email: "laurenziosambany@gmail.com"
            },
        },
        servers:[
            { 
                url: "http://localhost:5000",
                description: "Local dev"
            }
        ],
        components: {
          securitySchemes: {
            jwt: {
              type: "http",
              scheme: "bearer",
              in: "header",
              bearerFormat: "JWT",
              description: "JWT authorization usign JWT Bearer security scheme"
            },
          }
        }
    },
    apis: ["./src/router/*.js"]
}

const specs = swaggerJsDoc(options)
app.use('/swagger', swaggerUI.serve, swaggerUI.setup(specs))


app.listen(5000,()=>{
    console.log('I am listen to you brother')
})