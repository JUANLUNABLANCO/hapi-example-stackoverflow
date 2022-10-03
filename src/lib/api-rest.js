'use strict'
const Joi = require('joi')
const Questions = require('../models/index').question
const Boom = require('@hapi/boom')

// creando el plugin 'api-rest' para 2 rutas questions.getOne(key) y questions.getLast(amount)
module.exports = {
    name: 'api-rest',
    version: '1.0.0',
    async register(server, options) {
        const prefix = options.prefix || 'api'
        server.route({
            method: 'GET',
            path: `/${prefix}/question/{key}`,
            options: {
                validate: {
                    params: Joi.object({
                        key: Joi.string().required()
                    }),
                    failAction: failValidation
                }

            },
            handler: async(request, h) => {
                let result
                try {
                    result = await Questions.getOne(request.params.key)
                    if (!result) {
                        Boom.notFound(`No se pudo encontrar esa pregunta: ${request.params.key}`)
                    }
                } catch (error) {
                    Boom.notFound(`Hubo un error buscando ${request.params.key} - ${error}`)
                }
                return result
            }
        })

        server.route({
            method: 'GET',
            path: `/${prefix}/questions/{amount}`,
            options: {
                validate: {
                    params: Joi.object({
                        amount: Joi.number().integer().min(1).max(20).required()
                    }),
                    failAction: failValidation
                }
            },
            handler: async(request, h) => {
                let result
                try {
                    result = await Questions.getLast(request.params.amount)
                    if (!result) {
                        Boom.notFound(`No se pudo recuperar las preguntas`)
                    }
                } catch (error) {
                    Boom.notFound(`Hubo un error buscando las preguntas - ${error}`)
                }
                return result

            }
        })

        function failValidation(request, h, err) {
            return Boom.badRequest('Por favor use los parámetros correctos')
        }
    }
}