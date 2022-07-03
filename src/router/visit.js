const express = require("express")
const generatedId = require('../services/services')
const {authenticateToken} = require('../controller/authentication')

const router = express.Router()
const idlength = 8

/**
 * @swagger
 * components:
 *  schemas:
 *      Visit:
 *          type: object
 *          required:
 *              - visitor_id
 *              - site_id
 *              - duration
 *              - date_visit
 *          properties:
 *              id:
 *                  type: string
 *                  description: Visit's id (auto generated)
 *                  readOnly: true
 *              visitor_id:
 *                  type: string
 *                  description: The id of the visitor
 *              site_id:
 *                  type: string
 *                  description: The id of the site
 *              duration:
 *                  type: integer
 *                  description: The duration of the visit (number of the day)
 *              date_visit:
 *                  type: string
 *                  format: date
 *                  description: The date of the visit
 *          example:
 *              visitor_id: string
 *              site_id: string
 *              duration: 0
 *              date_visit: string   
 */

/**
 * @swagger
 * tags:
 *  name: Visits
 *  description: The visit managing API
 */


/**
 * @swagger
 * /api/visits:
 *  get:
 *      summary: Returns all visits in the system
 *      tags: [Visits]
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The list of visits
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Visit'
 */

router.get('/', authenticateToken, (req, res)=>{
    let visits = req.app.db.get("visits")
    res.send(visits)
})

/**
 * @swagger
 * /api/visits/sites/{id}:
 *  get: 
 *      summary: Returns All visitors by site
 *      tags: [Visits]
 *      parameters: 
 *          - name: id
 *            in: path
 *            schema:
 *              type: string
 *            required: true
 *            description: The site id
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: Returns All visits by site_id
 *              content:
 *                  application/json:
 *                      schema:
 *                          visite_log:
 *                              type: object
 *                              properties:
 *                                  data:
 *                                     type: array
 *                                     items:
 *                                          type: object
 *                                          properties:
 *                                              visitor:
 *                                                  $ref: '#/components/schemas/Visitor'
 *                                              date:
 *                                                  type: string
 *                                                  format: date
 *                                              tarif:
 *                                                  type: number
 *                                              duration:
 *                                                  type: integer
 *                                              amount:
 *                                                  type: number
 *                                  total:
 *                                      type: number
 *                          
 *          '404':
 *              description: Visit Not Found
 *              content:
 *                  application/json:
 *                      schema:
 *                          message:
 *                              type: string
 *                          example: 'No visit in the site'
 *          '500':
 *              description: Some server error
 */
router.get('/sites/:id', authenticateToken, (req, res)=>{
    try {
        let visits=req.app.db.get('visits').filter({site_id: req.params.id})
        let site = req.app.db.get('sites').find({id: req.params.id}).value()

        let total = 0
        let log = {
            data: [],
            total: total
        }

        if(!visits.value()){
            res.status(404).send({"message": "No visit in the site"})
        }else{
            visits.value().forEach(visit => {
                let visitor = req.app.db.get('visitors').find({id: visit.visitor_id}).value()
                let amount = site.tarif * visit.duration
                total += amount
                log.data.push({
                    "visitor": visitor,
                    "date": visit.date_visit,
                    "tarif": site.tarif,
                    "duration": visit.duration,
                    "amount": amount,
                })
                log.total = total  
            });

            res.send(log)
        }   
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/sites/:site_id/visitors/:visitor_id', (req, res)=>{

})


/**
 * @swagger
 * /api/visits:
 *  post:
 *      summary: Create new visit
 *      tags: [Visits]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Visit'
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The visit was successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/component/schemas/Visit'
 *          '404':
 *              description: Not Found
 *              content:
 *                  application/json:
 *                      schema:
 *                          message:
 *                              type: string
 *                          example: 'Not found message'
 *          '500':
 *              description: Some server error
 */
router.post('/', authenticateToken, (req, res)=>{
    try {
        
        let visitor = req.app.db.get('visitors').find({id: req.body.visitor_id})
        let site = req.app.db.get('sites').find({id: req.body.site_id})
        
        if(!visitor.value() && !site.value()){
            res.status(404).send({"message": "Visitor & site were not found"})
        }else if(!site.value()){
            res.status(404).send({"message": "Site was not found"})
        }else if(!visitor.value()){
            res.status(404).send({"message": "Visitor was not found"})
        }else{
            //count post request
            let _visits= req.app.db.get("_visits").value()[0]
            _visits.nb++

            const visit = {
                id: generatedId("VIS", _visits.nb, idlength),
                ...req.body
            }
            req.app.db.get('visits').push(visit).write()
            res.send(visit)
        }
    } catch (error) {
        res.status(500).send(error)
    }
})


/**
 * @swagger
 * /api/visits/{id}:
 *  put:
 *      summary: Update visit by id
 *      tags: [Visits]
 *      parameters:
 *          - name: id
 *            in: path
 *            schema:
 *              type: string
 *              description: The visit id 
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Visit'
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The visit was successfully updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/component/schemas/Visit'
 *          '404':
 *              description: Not Found
 *              content:
 *                  application/json:
 *                      schema:
 *                          message:
 *                              type: string
 *                          example: 'Not found message'
 *          '500':
 *              description: Some server error
 */
router.put('/:id', authenticateToken, (req, res)=>{
    try {
        let visit = req.app.db.get('visits').find({id:req.params.id}) 
        let visitor = req.app.db.get('visitors').find({id: req.body.visitor_id})
        let site = req.app.db.get('sites').find({id: req.body.site_id})
        
        if(!visit.value()){
            res.status(404).send({"message": "Visit not found"})
        }else{
            if(!visitor.value() && !site.value()){
                res.status(404).send({"message": "Visitor & site were not found"})
            }else if(!site.value()){
                res.status(404).send({"message": "Site was not found"})
            }else if(!visitor.value()){
                res.status(404).send({"message": "Visitor was not found"})
            }else{
                visit.assign(req.body).write()
                res.send(visit)
            }
        }
    } catch (error) {
        res.status(500).send(error)
    } 
})


/**
 * @swagger
 * /api/visits/{id}:
 *  delete:
 *      summary: Delete the visit by id
 *      tags: [Visits]
 *      parameters:
 *          - name: id
 *            in: path
 *            schema:
 *              type: string
 *              description: The visit id
 *      security:
 *          - jwt: []
 *      responses:
 *          '200':
 *              description: The visit was successfully deleted
 *          '404':
 *              description: Not Found
 *              content:
 *                  application/json:
 *                      schema:
 *                          message:
 *                              type: string
 *                          example: 'Not found message'
 *          '500':
 *              description: Some server error
 */
router.delete('/:id', authenticateToken, (req, res)=>{
    let visit = req.app.db.get("visits").find({id: req.params.id})
        
    if(!visit.value()){
        res.status(404).send({"message": "Visit not Found"})
    }
    else{
        req.app.db.get("visits").remove({id: req.params.id}).write()
        res.sendStatus(200)
    }
})

module.exports = router
