'use strict'

const Joi = require('joi');
const site = require('./controllers/sites.controller');
const user = require('./controllers/users.controller');
const question = require('./controllers/questions.controller');



module.exports = [{
        method: 'GET',
        path: '/',
        handler: site.home,
        options: {
            cache: { // frontend cache
                expiresIn: 30 * 1000,
                privacy: 'private'
            }
        }
    },
    {
        method: 'GET',
        path: '/register',
        handler: site.register
            // los datos del registro serán enviados a /create-user tipo POST gracias al action del formulario
    },
    {
        method: 'GET',
        path: '/login',
        handler: site.login
            // los datos del registro serán enviados a /create-user tipo POST gracias al action del formulario
    },
    {
        method: 'GET',
        path: '/logout',
        handler: user.logout
            // los datos del registro serán enviados a /create-user tipo POST gracias al action del formulario
    },
    {
        method: 'GET',
        path: '/ask',
        handler: site.questionForm
            // los datos del registro serán enviados a /create-user tipo POST gracias al action del formulario
    },
    {
        method: 'GET',
        path: '/question/{id}',
        handler: site.viewQuestion
            // los datos del registro serán enviados a /create-user tipo POST gracias al action del formulario
    },
    {
        method: 'GET',
        path: '/answer/{questionId}/{answerId}',
        handler: question.setAnswerRight
            // los datos del registro serán enviados a /create-user tipo POST gracias al action del formulario
    },
    {
        method: 'POST',
        path: '/create-user',
        handler: user.create,
        options: {
            validate: { // 123456789098765
                payload: Joi.object({
                    name: Joi.string().required().min(3),
                    email: Joi.string().required().email(),
                    password: Joi.string().required().min(6),
                    repeatPassword: Joi.ref('password')
                }),
                failAction: user.failValidation
            }
        }
    },
    {
        method: 'POST',
        path: '/authorizing-user',
        handler: user.authorization,
        options: {
            validate: {
                payload: Joi.object({
                    email: Joi.string().required().email(),
                    password: Joi.string().required().min(6)
                }),
                failAction: user.failValidation
            }
        }
    },
    {
        method: 'POST',
        path: '/create-question',
        handler: question.createQuestion,
        options: {
            validate: { // 123456789098765
                payload: Joi.object({
                    title: Joi.string().required().min(5).max(100),
                    description: Joi.string().required().min(5).max(1000),
                    image: Joi.any().optional()
                }),
                failAction: question.failValidation
            },
            payload: {
                parse: true,
                multipart: true,
            },
        }
        // los datos del registro serán enviados a /create-user tipo POST gracias al action del formulario
    },
    {
        method: 'POST',
        path: `/answer-question`,
        handler: question.answerQuestion,
        options: {
            validate: { // 123456789098765
                payload: Joi.object({
                    answer: Joi.string().required().min(5).max(1000),
                    id: Joi.string().required()
                }),
                failAction: question.failValidation
            }
        }
        // los datos del registro serán enviados a /create-user tipo POST gracias al action del formulario
    },
    {
        method: 'GET',
        path: '/diferentResponses',
        handler: site.diferentResponses
    },
    {
        method: 'GET',
        path: '/hello/{name?}',
        handler: site.hello
    },
    {
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: '.',
                index: ['index.html']
            }
        }
    },
    {
        method: ['GET', 'POST'],
        path: '/{any*}',
        handler: site.notFound
    }
]