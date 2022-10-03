'use strict'

const firebase = require('firebase-admin')
const serviceAccount = require('../config/firebaseAccessAdmin.json');

// models
const User = require('./users.model');
const Question = require('./question.model');

// conectandose a la bd de firebase

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://stackoverflow-7e0ec-default-rtdb.europe-west1.firebasedatabase.app/'
})


const DB = firebase.database();
// El objeto Users está conectado a la base de datos, y tiene el método crete(data)
module.exports = {
    user: new User(DB),
    question: new Question(DB, User)
}