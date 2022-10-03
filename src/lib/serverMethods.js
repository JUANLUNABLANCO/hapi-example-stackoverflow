'use strict'

const Question = require('../models/index').question

async function setAnswerRight(questionId, answerId, user) {
    let result = 'pollo';
    try {
        result = await Question.setAnswerRight(questionId, answerId, user)

    } catch (error) {
        console.error(error)
        return false
    }
    console.log(result) // undefined ????
    return result
}

async function getLast(amount) {
    let data;
    try {
        data = await Question.getLast(amount)
    } catch (error) {
        console.error(error)
        return false
    }
    // console.log('Método cacheado en el servidor')
    return data
}

module.exports = {
    setAnswerRight,
    getLast
}