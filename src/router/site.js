const express = require('express')
const generatedId = require('../services/services')

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
 *                  readOnly: true
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
 *          
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
 * /api/sites/all:
 *  get: 
 *      summary: Returns a list of an amount total & number of the visit for each site
 *      tags: [Sites]
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: List of an amount total & number of the visit for each site
 *              content:
 *                  application/json:
 *                      schema:
 *                          site_log:
 *                              type: array
 *                              items: object
 *                              properties:
 *                                  name: 
 *                                      type: string
 *                                      description: name of the site
 *                                  nbVisits:
 *                                      type: integer
 *                                      description: Total number of visits
 *                                  total:
 *                                      type: number
 *                                      description: Amount total
 *                          
 *          '500':
 *              description: Some server error
 */
 router.get("/all", (req, res)=>{
    try {
        let sites = req.app.db.get('sites').value()

        let log = []

        sites.forEach(site => {
            let visits = req.app.db.get("visits").filter({site_id: site.id}).value()
            if(!visits){
                log.push({
                    "name": site.name,
                    "nbVisits": 0,
                    "total": 0
                })
            }else{
                let total = 0
                let nbVisits = 0
                visits.forEach(visit => {
                    let amount = site.tarif * visit.duration
                    total += amount
                    nbVisits++                    
                });
                
                log.push({
                    "name": site.name,
                    "nbVisits": nbVisits,
                    "total": total
                })
            }
        }); 
        res.send(log)  
    } catch (error) {
        res.status(500).send(error)
    }
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
 *      security:
 *          - jwt: []
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
       
        //count post request
        let _sites= req.app.db.get("_sites").value()[0]
        _sites.nb++
        const site = {
            id: generatedId("S", _sites.nb, idlength),
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
 *      security:
 *          - jwt: []
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
 *      security:
 *          - jwt: []
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
        req.app.db.get("visits").remove({site_id: req.params.id}).write()
        res.sendStatus(200)
    }
})


module.exports = router