const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const generatedId = require('../services/services')
const {generateAccessToken, generateRefreshToken} = require('../controller/authentication')

const idlength = 5

/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *              - username
 *              - email
 *              - password
 *          properties:
 *              username:
 *                  type: string
 *                  description: The user's name
 *              email:
 *                  type: string
 *                  format: email
 *                  description: The user's email
 *              password:
 *                  type: string
 *                  description: The user's password  
 *          example:
 *              username: "Laurenz19"
 *              email: "laurenziosambany@gmail.com"
 *              password: "Laurenz19"  
 * 
 *      Login:
 *          type: object
 *          required: 
 *              - email
 *              - password
 *          properties:
 *              email: 
 *                  type: string
 *                  format: email
 *                  description: The user's email
 *              password: 
 *                  type: string
 *                  description: The user's password
 *          example:
 *              email: "laurenziosambany@gmail.com"
 *              password: "string"
 */

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: The user managing API
 */

router.get('/users', (req, res)=>{

})

/**
 * @swagger
 * /api/register:
 *  post:
 *      summary: Create new user 
 *      tags: [Users]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          '200':
 *              description: The user was successfully created
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          '500':
 *              description: Some server error 
 */
router.post('/register', async (req, res)=>{
    try {
        let _users = req.app.db.get("_users").value()[0]
        _users.nb++
        console.log(_users.nb)
        
        //hashing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const user = {
            id: generatedId("U", _users.nb,idlength),
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        }

        req.app.db.get('users').push(user).write()
        
        res.send({
           id: user.id,
           username: user.username,
           email: user.email 
        })   
    } catch (error) {
        res.status(500).send(error)
    }
})


/**
 * @swagger
 * /api/login:
 *  post:
 *      summary: Sign in 
 *      tags: [Users]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Login'
 *                      
 *      responses:
 *         '200':
 *            description: Valid Credentials
 *            content:
 *                application/json:
 *                  schema:
 *                    accessToken:
 *                      type: string
 *         '404':
 *            description: User not found
 *            content:
 *                application/json:
 *                  schema:
 *                    message:
 *                       type: string
 *                    example: The user was not found
 *         '400':
 *            description: Invalid Credentials
 *            content:
 *                application/json:
 *                   schema:
 *                     message:
 *                      type: string
 *                     example: Invalid credentials
 *                               
 * 
 */
router.post('/login', async (req, res)=>{
    try {
        let user = req.app.db.get('users').find({email:req.body.email}).value()
        if(!user){
            res.status(404).send({
                "message": "user not found"
            })
        }else{

            //compare password
            if(!await bcrypt.compare(req.body.password, user.password)){
                res.status(400).send({
                    "message": "invalid credentials"
                })
            }else{

                const accessToken = generateAccessToken({
                    username: user.username,
                    email: user.email
                })

                const refreshToken = generateRefreshToken({
                    username: user.username,
                    email: user.email
                })
                
                res.send({
                    accessToken,
                    refreshToken
                })
            }
        }
    } catch (error) {
        res.status(500).send(error)
    }
})


/**
 * @swagger
 * /api/refreshToken:
 *  post:
 *      summary: Refresh token  
 *      tags: [Users]   
 *      responses:
 *         '200':
 *            description: Valid Credentials
 *            content:
 *                application/json:
 *                  schema:
 *                    accessToken:
 *                      type: string
 *         '404':
 *            description: User not found
 *            content:
 *                application/json:
 *                  schema:
 *                    message:
 *                       type: string
 *                    example: The user was not found
 *         '401':
 *            description: Invalid Credentials
 *            content:
 *                application/json:
 *                   schema:
 *                     message:
 *                      type: string
 *                     example: Invalid credentials
 *                               
 * 
 */
router.post('/refreshToken', (req, res)=>{
    const authHeader = req.headers['authorization']
    console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      console.log(err)
      if (err) return res.sendStatus(401)
      
      delete user.exp
      delete user.iat

      //check if user exist in the database
      const refreshToken = generateAccessToken(user)
      res.send({
        accessToken: refreshToken
      })
    })
})



module.exports = router