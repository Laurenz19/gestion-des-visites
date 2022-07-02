const express = require('express')
const nanoid = require('nanoid')

const router = express.Router()

const idlength = 5


/**
 * @swagger
 * components:
 *  schemas:
 *      Site:
 *          type: object
 *          required:
 *              - name
 *              - place
 *              - tarif
 *          properties:
 *              id:
 *                  type: string
 *                  description: The site's id (auto generated)
 *              name:
 *                  type: string
 *                  description: The name of the site
 *              place:
 *                  type: string
 *                  description: The place of the site
 *              tarif: 
 *                  type: number
 *                  description: The tarif by day (Ariary)
 *          example:
 *              id: "S-0001"
 *              name: "Site touristique"
 *              place: "The place of the site"
 *              tarif: 1000
 */

/**
 * @swagger
 * tags:
 *  name: Sites
 *  description: The site managing API
 */

/**
 * @swagger
 * /api/sites:
 *  get:
 *      summary: Returns all sites in the system
 *      tags: [Sites]
 *      responses:
 *          '200':
 *              description: The list of sites
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Site'
 */

router.get("/", (req, res)=>{
    let sites = req.app.db.get("sites")
    res.send(sites)
})


/**
 * @swagger
 * /api/sites/{id}:
 *  get:
 *      summary: Return the site by id
 *      tags: [Sites]
 *      parameters:
 *          - name: id
 *            in: path
 *            schema:
 *              type: string
 *            required: true
 *            description: The site id
 *      responses:
 *          '200':
 *              description: Get the site by id
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Site'
 *          '404':  
 *              ddescription: The site was not found
 */

router.get("/:id", (req, res)=>{
    let site = req.app.db.get("sites").find({id: req.params.id}).value()

    if(!site) res.sendStatus(404)
    else{
        res.send(site)
    }
})

/**
 * @swagger
 * /api/sites:
 *  post:
 *      summary: Create new site
 *      tags: [Sites]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Site'
 *      responses:
 *          '200':
 *              description: The site was successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Site'
 *          '500':
 *              description: Some server error
 */

router.post("/", (req, res)=>{  
    try {
        const site = {
            id: nanoid(idlength),
            ...req.body
        } 

        req.app.db.get("sites").push(site).write()
        res.send(site)
    } catch (error) {
        res.status(500).send(error)
    }
})

/**
 * @swagger
 * /api/sites/{id}:
 *  put:
 *      summary: Update the site by id
 *      tags: [Sites]
 *      parameters:
 *          - name: id
 *            in: path
 *            schema:
 *              type: string
 *            required: true
 *            description: The site id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Site'
 *      responses:
 *          '200':
 *              description: The site was successfully updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Site'
 *          '404':
 *              description: The site was not found
 *          '500':
 *              description: Some server error
 */

router.put("/:id", (req, res)=>{
    try {
        let site = req.app.db.get("sites").find({id: req.params.id})
        
        if(!site.value()) res.sendStatus(404)
        else{
            site.assign(req.body).write()
            res.send(req.app.db.get("sites").find({id: req.params.id}))
        }

    } catch (error) {
        res.status(500).send(error)
    }
})

/**
 * @swagger
 * /api/sites/{id}:
 *  delete:
 *      summary: Delete the site by id
 *      tags: [Sites]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The site id
 *      responses:
 *          '200':
 *              description: The site was successfully deleted
 *          '404':
 *              description: The site was not found
 */

router.delete("/:id", (req, res)=>{
    let site = req.app.db.get("sites").find({id: req.params.id})
        
    if(!site.value()){
        res.sendStatus(404)
    }
    else{
        req.app.db.get("sites").remove({id: req.params.id}).write()
        res.sendStatus(200)
    }
})

module.exports = router