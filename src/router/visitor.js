const express = require('express')
const generatedId = require('../services/services')
const {authenticateToken} = require('../controller/authentication')

const router = express.Router()


const idlength = 5


/**
 * @swagger
 * components: 
 *  schemas:
 *      Visitor:
 *          type: object
 *          required:
 *              - name
 *              - address
 *          properties:
 *              id: 
 *                  type: string
 *                  description: vistor's id (auto generate)
 *                  readOnly: true
 *              name:
 *                  type: string
 *                  description: the visitor's complete name
 *              address:
 *                  type: string
 *                  description: the visitor's address
 *          example:
 *              name: "Sambany Michel Laurenzio"
 *              address: "Tanambao, Fianarantsoa"
 *                  
 */

/**
 * @swagger
 * tags:
 *  name: Visitors
 *  description: The visitor managing API
 */

/**
 * @swagger
 * /api/visitors:
 *  get:
 *      summary: Returns the list of visitors 
 *      tags: [Visitors]
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: A list of visitors
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Visitor'
 */

router.get("/", authenticateToken, (req, res)=>{
    const visitors = req.app.db.get("visitors")
    res.send(visitors)
})

/**
 * @swagger
 * /api/visitors/{visitor_name}:
 *  get:
 *      summary: Get the visitor by name
 *      tags: [Visitors]
 *      parameters:
 *        - in: path
 *          name: visitor_name
 *          schema:         
 *              type: string
 *          required: true
 *          description: The visitor name
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The visitor description by name
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Visitor'
 *          '404':
 *              description: The visitor was not found
 *               
 */

 router.get("/:visitor_name", authenticateToken, (req, res)=>{
    console.log(req.params.name)
    const visitor = req.app.db.get("visitors").find({name: req.params.visitor_name}).value()
    if(!visitor){
        res.sendStatus(404)
    }
    res.send(visitor)
})


/**
 * @swagger
 * /api/visitors/{id}:
 *  get:
 *      summary: Get the visitor by id
 *      tags: [Visitors]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:         
 *              type: string
 *          required: true
 *          description: The visitor id
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The visitor description by id
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Visitor'
 *          '404':
 *              description: The visitor was not found
 *               
 */

router.get("/:id", authenticateToken, (req, res)=>{
    const visitor = req.app.db.get("visitors").find({id: req.params.id}).value()
    if(!visitor){
        res.sendStatus(404)
    }
    res.send(visitor)
})


/**
 * @swagger
 * /api/visitors:
 *  post:
 *      summary: Create new visitor
 *      tags: [Visitors]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Visitor'
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The visitor was successfully created
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Visitor'
 *          '500':
 *              description: Some server error
 */
router.post("/", authenticateToken, (req, res)=>{
    try {

        console.log()
        //count post request
        let _visitors= req.app.db.get("_visitors").value()[0]
        _visitors.nb++
        const visitor = {
            id:generatedId("V", _visitors.nb, idlength),
            ...req.body
        }
        req.app.db.get("visitors").push(visitor).write()
    
        // console.log(_visitors + 1)
        res.status(200).send(visitor)
    } catch (error) {
        return res.status(500).send(error)
    }
})


/**
 * @swagger
 * /api/visitors/{id}:
 *  put:
 *      description: Update the visitor by id
 *      tags: [Visitors]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The visitor's id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json: 
 *                  schema:
 *                      $ref: '#/components/schemas/Visitor'
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The visitor was succesfully updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Visitor'
 *          '404':
 *              description: The visitor was not found
 *          '500':
 *              description: Some server error
 */

router.put("/:id", authenticateToken, (req, res)=>{
    try {
        const visitor = req.app.db.get("visitors").find({id: req.params.id})

        if(!visitor.value()){
            res.sendStatus(404)
        }else{
            visitor.assign(req.body).write()
            res.send(req.app.db.get("visitors").find({id: req.params.id}))
        }
        
    } catch (error) {
        return res.status(500).send(error)
    }
})

/**
 * @swagger
 * /api/visitors/{id}:
 *  delete:
 *      summary: Delete The visitor by id
 *      tags: [Visitors]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The visitor's id
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The visitor was successfully deleted
 *          '404':
 *              description: The visitor was not found
 */
router.delete("/:id", authenticateToken, (req, res)=>{

    const visitor = req.app.db.get("visitors").find({id: req.params.id})

    if(!visitor.value()){
        res.sendStatus(404)
    }else{
        req.app.db.get("visitors").remove({id:req.params.id}).write()
        req.app.db.get("visits").remove({visitor_id: req.params.id}).write()
        res.status(200).send("success")
    }
})



module.exports = router