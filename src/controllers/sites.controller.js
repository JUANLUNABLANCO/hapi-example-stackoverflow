'use strict'

const { Boom } = require('@hapi/boom')

const Question = require('../models/index').question

async function home(request, h) {
    const data = await request.server.methods.getLast(10)
    return h.view('index', {
        title: 'Home',
        user: request.state.user,
        someQuestions: data
    })
}

function register(request, h) {
    return h.view('register', {
        title: 'Registro',
        user: request.state.user
    })
}

function login(request, h) {
    // un usuario no se puede loguear 2 veces
    if (request.state.user) {
        return h.redirect('/')
    }
    return h.view('login', {
        title: 'Ingreso',
        user: request.state.user
    })
}

function questionForm(request, h) {
    if (!request.state.user) {
        return h.redirect('/login')
    }
    return h.view('ask', {
        title: 'Crear Pregunta',
        user: request.state.user
    })
}
async function viewQuestion(request, h) {
    let data;
    try {
        data = await Question.getOne(request.params.id)
        if (!data)
            return notFound(request, h)
    } catch (error) {
        console.error(error)
    }
    return h.view('question', {
        title: 'Detalles de la pregunta',
        user: request.state.user,
        question: data,
        key: request.params.id
    })
}

function notFound(request, h) {
    return h.view('404', {}, { layout: 'error-layout' }).code(404);
}

function fileNotFound(request, h) {
    const response = request.response
            // console.log('si o no: ', request.path.startsWith('/api'))
    if (!request.path.startsWith('/api') && response.isBoom && response.output.statusCode === 404) {
        return h.view('404', {}, { layout: 'error-layout' }).code(404);
    }
    return h.continue
}

function diferentResponses(request, h) {
    const user = {
            firstName: 'John',
            lastName: 'Doe',
            userName: 'JohnDoe',
            id: 123
        }
        // return 'Hello world!'
        // return h.response('Hola Mundo, desde Hapi usando el objeto h.response').code(200);
        // return h.redirect('http://www.platzi.com')
    return user
}

function hello(request, h) {
    const name = request.params.name ? request.params.name : 'Pollo';
    return 'Hello ' + name
}

module.exports = {
    home,
    register,
    login,
    questionForm,
    viewQuestion,
    notFound,
    fileNotFound,
    diferentResponses,
    hello
}