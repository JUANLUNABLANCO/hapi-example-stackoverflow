'use strict'

class Question {
    constructor(db) {
        this.db = db;
        this.ref = this.db.ref('/')
        this.collection = this.ref.child('questions')

    }

    async create(info, user, filename) {
        const data = {
            title: info.title,
            description: info.description,
            owner: user,
        };
        if (filename) {
            data.filename = filename
        }

        const newQuestion = this.collection.push(data)
        return newQuestion.key
    }

    async getLast(amount) {
        const questionsQuery = await this.collection.limitToLast(amount).once('value');
        const data = questionsQuery.val();
        return data;
    }

    async getOne(id) {
        const questionQuery = await this.collection.child(id).once('value');
        const data = questionQuery.val();
        return data;
    }

    // crear una respuesta dentro de las preguntas
    async answer(data, user) { // data --> response.payload ==> {text: data.answer, id: data.id}
            const answers = await this.collection.child(data.id).child('answers').push({ text: data.answer, user: user })
            return answers;
        }
        // async getResponses(idQuestion) {
        // const responsesQuery = await this.collection.child
        // }
    async setAnswerRight(questionId, answerId, user) {
        const query = await this.collection.child(questionId).once('value')
        const question = query.val()
        const answers = question.answers

        if (!user.email === question.owner.email) {
            return false
        }

        for (let key in answers) {
            answers[key].correct = (key === answerId); // true or false
        }

        const updateAnswers = await this.collection.child(questionId).child('answers').update(answers)
        console.log(updateAnswers); // no lo imprime porque no le sale ...
        return updateAnswers
    }
}
module.exports = Question;