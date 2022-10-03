'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')
const { join } = require('path')

const Boom = require('@hapi/boom')
const uuid = require('uuid').v1

const Question = require('../models/index').question

async function createQuestion(request, h) {
    if (!request.state.user) {
        return h.redirect('/login')
    }
    // const userData = request.payload
    let resultId;
    const Write = promisify(writeFile)

    try {
        // request.log('DATA', request.payload);
        if (Buffer.isBuffer(request.payload.image)) { // si llegó un archivo
            const filename = `${uuid()}.png` // genera nombre aleatorio, que no se repetirá nunca
            await Write(
                join(__dirname, '..', 'public', 'uploads', filename), // path to file
                request.payload.image, // content
                { // options
                    // encoding: 'utf8' // si fuese texto pues si
                    // mode: 0o666, // por defecto vale eso
                    flag: 'wx' // si existe lanza un error
                })
            resultId = await Question.create(request.payload, request.state.user, filename);

        }

        // request.log('DATA', result);
    } catch (error) {
        request.log('ERROR', error);
        // return h.response('Problemas creando el usuario').code(500);
        return h.view('create-question', {
            title: 'Asking question',
            error: 'Problemas creando la pregunta'
        })
    }
    return h.redirect(`question/${resultId}`)
        // return h.response(`Pregunta creada con el id: ${resultId}`)
}

async function failValidation(request, h, error) {
    const templates = {
            '/create-question': 'ask',
            '/answer-question': `question/${request.payload.id}`
        }
        // return Boom.badRequest('Falló la validación', request.payload)
        // request.log('INFO', request.path);
    request.log('DATA', request.payload)
    return h.view(templates[request.path], {
        title: 'Error de Validación',
        error: 'Por favor revisa los campos WEI!'
    }).code(400).takeover(); // se salta el error (400, del boom) con el takeover() y retorna la vista
}

async function answerQuestion(request, h) {
    if (!request.state.user) {
        return h.redirect('/login')
    }
    let resultId;
    try {
        resultId = await Question.answer(request.payload, request.state.user)
        request.log('DATA', `Respuesta creada: ${resultId}`)
    } catch (error) {
        request.log('ERROR', error)
    }
    // return h.view(`/question/${request.payload.id}`, {
    //     title: 'Respondiendo a una pregunta',
    //     user: request.state.user
    // })
    return h.redirect(`/question/${request.payload.id}`)
}

async function setAnswerRight(request, h) {
    if (!request.state.user) {
        return h.redirect('/login')
    }
    let result
    try {
        result = await request.server.methods.setAnswerRight(
            request.params.questionId,
            request.params.answerId,
            request.state.user)
    } catch (error) {
        request.log('ERROR', error)
    }
    return h.redirect(`/question/${request.params.questionId}`);
    // esto actualizará las answers, porue van en la data del view
}

module.exports = {
    createQuestion,
    failValidation,
    answerQuestion,
    setAnswerRight
}