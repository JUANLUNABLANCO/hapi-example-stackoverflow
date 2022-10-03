'use strict'

const bcrypt = require('bcrypt');
// const { ref, set } = require('firebase/database');


class User {
    constructor(db) {
        this.db = db;
        this.ref = this.db.ref('/')
        this.collection = this.ref.child('users')

    }

    async create(data) {
        const user = {...data };
        user.repeatPassword = null;
        user.password = await this.constructor.encrypt(user.password); // metodo statico, luego lo sacamos de esta clase
        const newUser = this.collection.push(user)
        return newUser.key
    }
    async checkCredentialsLogin(data) {
        const userAuth = {...data }; // debido a que firebase añade al payloda un objeto tipo null, que ensucia la data
        // const passEncrypted = await this.constructor.encrypt(userAuth.password);
        const userQuery = await this.collection.orderByChild('email').equalTo(userAuth.email).once('value'); // una query simple en firebase para extraer los usuarios ordenados por email cuyo email sea el dado por data, obtendremos en user completo {id, email, password, ...}
        const userFound = userQuery.val();
        console.log(userFound);
        if (userFound) {
            const userId = Object.keys(userFound)[0];
            const passwdRight = await bcrypt.compare(userAuth.password, userFound[userId].password)
            return (passwdRight) ? userFound[userId] : false; // true or userFound[userId]
        }
        return false;
    }

    static async encrypt(password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword;
    }
}

module.exports = User;