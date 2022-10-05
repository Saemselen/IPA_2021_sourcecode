<!--

 * Path: '/client/src/components/User.vue'
 * Author: Samis Moser
 * Desc: User-Page 

-->
<template>
    <div class="wrapper">
        <div class="content">
            <h1>{{data.user.username}}</h1>
            <div>
                <label>Name:</label><p>{{data.user.fullname}}</p>
            </div>
            <div>
                <label>Berechtigungsstufe:</label><p>{{data.user.perm}}</p>
            </div>
            <div>
                <label>Anzahl Projekte:</label><p id="projectCount">{{data.projectCount}}</p>
            </div>
            <button @click="logout()">Abmelden</button>
        </div>
    </div>
</template>

<script>
// imports
import { reactive } from "vue"

// import config-file
import config from "../config.json"

export default {
    setup(props, context) {
        // set reactive data object to manipulate the DOM
        const data = reactive({user:{}})
        
        // function to decode JWT-Payload ( used to get information about
        // the user logged in )
        const decodeTokenPayload = (token) => {
            let payload = token.replace(/-/g, '+').replace(/_/g, '/').split('.')[1]
            payload = JSON.parse(Buffer.from(payload, 'base64').toString())
            return payload
        }

        // logout-function ( removes JWT from localStorage, 
        // emits 'loggedout' event)
        const logout = () => {
            localStorage.removeItem("jwt")
            context.emit("loggedout", false)
        }

        // function to get the count of projects of the
        // current logged-in user
        const fetchCount = async () => {
            return new Promise(async resolve => {
                let fetchOptions = {
                    "method": "GET",
                    "headers": {
                        "Content-Type": "application/json",
                        "authorization": localStorage.jwt
                    }
                }
                // api-call [ GET '/api/projectsgetCountByUser' ]
                // query-Strings ( URL ):
                // - uid ( integer ) { ID of logged-in user }
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/getCountByUser?uid=${data.user.uid}`
                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()
                if(result.status) {
                    resolve(result.data)
                }
                else {
                    resolve(false)
                }
            })
        }

        // set reactive user-object to decoded JWT-payload
        data.user = decodeTokenPayload(localStorage.jwt)
        
        setTimeout(async () => {
            // fetch count of projects on page setup
            data.projectCount = await fetchCount()
        },100)
        
        return { logout, data }
    }
}
</script>

<style scoped>
.wrapper {
    text-align: center;
    display: block;
}
.content {
    padding: 30px;
    background:#fff;
    margin-top:100px;
    margin-left: 300px;
    margin-right: 300px;
    box-shadow: 1px 1px 3px #b8b8b8;
    border-radius: 7px;
}
label {
    font-weight: bold;
}
.content div {
    display: block;
    text-align: left;
}
.content div p, .content div label {
    display: inline-block;
    margin-top: 5px;
    margin-bottom: 5px;
    margin-left: 5px;
}
#projectCount {
    color:#00aaed;
    font-weight: bold;
}
button {
    margin-top:10px;
    border:0;
    border-radius: 15px;
    background:#00aaed;
    padding:10px;
    box-shadow: 1px 1px 3px #b8b8b8;
    font-weight: bold;
    color:#fff;
    cursor:pointer;
}
button:hover {
    box-shadow: 2px 2px 5px #b8b8b8;
    transform: scale(1.05);
}
</style>