<!--

 * Path: '/client/src/components/Login.vue'
 * Author: Samis Moser
 * Desc: Login component

-->

<template>
    <div class="loginWrapper">
        <div class="loginContainer">
            <h1>LDAP-Login</h1>
            <form @keyup.enter="submit()">
                <input type="text" id="username" placeholder="Benutzername.." required>
                <input type="password" id="password" placeholder="Passwort.." required>
                <button type="button" @click="submit()">Anmelden</button>
            </form>
    </div> 
    </div>
</template>

<script>
// import config-file
import config from "../config.json"

export default {
    setup(props, context) {
        // error function (sends JavaScript-alert with specific message)
        const error = (message) => {
            alert(`Fehler, ${message}`)
        }

        // function to authenticate user (LDAP) with 
        // username (sAMAccountName) and password 
        const authLDAP = (username, password) => {
            return new Promise(async resolve => {
                let fetchOptions = {
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({
                        username: username, 
                        password: password
                    })
                }
                // api-call [ POST '/api/users/authenticate' ]
                // request-body:
                // - username ( String )
                // - password ( String )
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/authenticate`

                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()

                resolve(result)
            })
        }
        
        // function to check if local user with specific username exists
        const checkLocalUser = (username) => {
            return new Promise(async resolve => {
                // api-call [ GET '/api/users/checkLocalUser' ]
                // query-Strings ( URL ):
                // - username ( String )
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/checkLocalUser?username=${username}`

                let response = await fetch(api_url)
                let result = await response.json()

                resolve(result)
            })
        }

        // function to create user in local Database from UserData ( LDAP )
        const createLocalUser = (data) => {
            return new Promise(async resolve => {
                let fetchOptions = {
                    "method": "PUT",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({userData:data})
                }
                // api-call [ PUT '/api/users/createLocalUser' ]
                // request-body: 
                // - userData ( Object )
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/createLocalUser`

                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()

                resolve(result)
            })
        }

        // function to generate JSON-WebToken from UserObject
        const getToken = (userObject) => {
            return new Promise(async resolve => {
                let fetchOptions = {
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify(userObject)
                }
                // api-call [ POST '/api/users/generateToken' ]
                // request-body = userObject ( Object )
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/generateToken`
                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()
                resolve(result)
            })
        }

        // function to get ID of local user from username
        const getLocalUID = async (username) => {
            // api-call [ GET '/api/users/getLocalUID' ]
            // query-Strings ( URL ):
            // - username ( String )
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/getLocalUID?username=${username}`
            let response = await fetch(api_url)
            let result = await response.json()


            return {uid:result.uid,perm:result.perm}
        }

        // function to submit login values ( called on button click )
        const submit = async () => {
            let username_value = document.getElementById("username").value
            let password_value = document.getElementById("password").value

            // check if any of the inputs are empty ('true' if nothing is empty)
            let emptyInputs = username_value != "" && password_value != ""

            if(!emptyInputs) {
                // some inputs still empty
                error("bitte füllen Sie alle Felder aus.")
            }
            else {
                // no inputs empty
                let auth = await authLDAP(username_value, password_value)

                if(auth.error) {
                    error(auth.message)
                }

                // check if user already exists in local database
                let check = await checkLocalUser(username_value)

                // get local user id to insert into JWT-payload later
                let uid = await getLocalUID(username_value)
                auth.userData.uid = uid.uid
                auth.userData.perm = uid.perm


                
                if(!check.userExists) {
                    // create local account for user
                    let create = await createLocalUser(auth.userData)
                    if(create.error) {
                        error(create.error)
                    }
                }
                if(auth.status) {
                    // generate JWT
                    let generateToken = await getToken(auth.userData)
                    if(generateToken !== undefined && localStorage.jwt == undefined) {
                        localStorage.setItem("jwt", generateToken.token)
                        context.emit("userLoggedIn", generateToken.token)
                    }
                }
            }
        }
        return { submit }
    }
}
</script>

<style scoped>

.loginWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    
}
h1 {
    color:rgb(66, 66, 66);
}
.loginContainer {
    background:#fff;
    border-radius: 7px;
    width: 700px;
    height: 400px;
    padding: 30px;
    margin-top: 15%;
    box-shadow: 1px 1px 5px rgb(139, 139, 139);
}
.loginContainer input[type="text"], .loginContainer input[type="password"] {
    display: block;
    width: 70%;
    margin-left:15%;
    margin-bottom: 10px;
    padding: 10px;
    height: 40px;

    border: 1px solid #b8b8b8;
    box-shadow: 1px 1px 3px #b8b8b8;
}
input, button {
    border-radius: 5px;
}
input[type="text"]:focus, input[type="password"]:focus {
    box-shadow: 2px 2px 4px #b8b8b8;
}
.loginContainer button {
    width: 160px;
    height: 40px;
    float:right;
    margin-right:15%;
    border:none;
    background: #00aaed;
    color:#fff;
    font-weight: bold;
    box-shadow: 1px 1px 3px #b8b8b8;
    cursor: pointer;
}
.loginContainer button:hover {
    width: 200px;
}
.loginContainer form {
    width:100%;
    height:100%;
    margin-top: 10%;
}
button{
    border-bottom: 5px solid #ff7066;
}

</style>