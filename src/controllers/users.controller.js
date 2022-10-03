'use strict'

const Boom = require('@hapi/boom')
const user = require('../models/index').user

async function create(request, h) {
    // const userData = request.payload
    let resultId;
    try {
        // request.log('DATA', request.payload);
        resultId = await user.create(request.payload);
        // request.log('DATA', result);
    } catch (error) {
        console.error(error);
        // return h.response('Problemas creando el usuario').code(500);
        return h.view('register', {
            title: 'Registro',
            error: 'Problemas creando el usuario'
        })
    }
    return h.redirect('/').state('user', {
        name: request.payload.name,
        email: request.payload.email
    });
}

async function authorization(request, h) {
    let result;
    try {
        result = await user.checkCredentialsLogin(request.payload);
        if (!result) {
            return h.view('login', {
                title: 'Ingreso',
                error: 'No autorizado!. El Email y/o la contraseña no son correctos'
            })
        }
    } catch (error) {
        console.error(error);
        // return h.response('Problemas en el login').code(500);
        return h.view('login', {
            title: 'Ingreso',
            error: 'Problemas logueando el usuario, inténtelo de nuevo'
        })
    }
    // se ha logueado correctamente
    return h.redirect('/').state('user', {
        name: result.name,
        email: result.email
    });
}

function logout(request, h) {
    return h.redirect('/').unstate('user');
}

async function failValidation(request, h, error) {
    const templates = {
            '/create-user': 'register',
            '/authorizing-user': 'login'
        }
        // return Boom.badRequest('Falló la validación', request.payload)
        // request.log('PATH: ', request.path);
    return h.view(templates[request.path], {
        title: 'Error de Validación',
        error: 'Por favor complete los campos requeridos'
    }).code(400).takeover(); // se salta el error (400, del boom) con el takeover() y retorna la vista
}

module.exports = {
    create,
    authorization,
    logout,
    failValidation
}