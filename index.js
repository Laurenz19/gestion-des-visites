const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUI = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")
const low  = require("lowdb")
const visitorRoutes = require('./src/router/visitor')
const siteRoutes = require('./src/router/site')
const visitRoutes = require('./src/router/visit')

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
  _visits:[{"nb":0}]
}).write()


const app = express()
app.db = db

app.use(cors())
app.use(express.json())
app.use(morgan("dev"))


//routes
app.use('/api/visitors', visitorRoutes)
app.use('/api/sites', siteRoutes)
app.use('/api/visits', visitRoutes)


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
    components: {
        securitySchemes: {
          jwt: {
            type: "http",
            scheme: "bearer",
            in: "header",
            bearerFormat: "JWT"
          },
        }
      }
      ,
      security: [{
        jwt: []
      }],
    apis: ["./src/router/*.js"]
}

const specs = swaggerJsDoc(options)
app.use('/swagger', swaggerUI.serve, swaggerUI.setup(specs))


app.listen(5000,()=>{
    console.log('I am listen to you brother')
})