<!--

 * Path: '/client/src/components/Technologies.vue'
 * Author: Samis Moser
 * Desc: Technologies-Component ( To add / remove technoligies from catalogue )

-->
<template>
    <div class="content">
        <h1>Technologien</h1>
        <div class="form">
            <input type="text" id="techInput" placeholder="Neue Technologie..">
            <button type="button" @click="addTechnology()">+</button>
        </div>
        <div class="technologies">
            <div v-for="technology in data.technologies" v-bind:key="technology.ID">
                <p>{{technology.title}}</p>
                <i class="gg-trash" @click="removeTechnology(technology.ID)"></i>
            </div>
        </div>
    </div>
</template>

<script>
// imports
import { reactive } from "vue"

// import config-file
import config from "../config.json"

export default {
    setup() {
        // set reactive data object to manipulate the DOM
        const data = reactive({technologies:[]})

        // error function (sends JavaScript-alert with specific message)
        const error = (message) => {
            alert(`Fehler, ${message}`)
        }

        // function to add technology from text input
        const addTechnology = async () => {
            let title = document.getElementById('techInput').value
            let fetchOptions = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": localStorage.jwt
                },
                "body": JSON.stringify({title:title})
            }
            // api-call [ POST '/api/technologies/add' ]
            // request-body: 
            // - title ( String ) { title of technology to add }
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/technologies/add`

            let response = await fetch(api_url, fetchOptions)
            let result = await response.json()

            if(!result.status) {
                error(result.message)
            }
            else {
                // re-Fetch technologies after technology has been added
                fetchTechnologies()
            }
        }

        // api-call [ GET '/api/technologies/getAll' ]
        const fetchTechnologies = async () => {
            let fetchOptions = {
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": localStorage.jwt
                },
                "method": "GET"
            }

            // api-call [ GET '/api/technologies/getAll' ]
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/technologies/getAll`

            let response = await fetch(api_url, fetchOptions)
            let result = await response.json()

            // set reactive technologies-Array to response data
            data.technologies = result.data
        }

        // function to remove specific technology
        const removeTechnology = async (id) => {
            let fetchOptions = {
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": localStorage.jwt
                },
                "method": "DELETE",
                "body": JSON.stringify({id:id})
            }
            // api-call [ DELETE '/api/technologies/remove' ]
            // request-body:
            // - id ( integer ) { ID of technology to remove }
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/technologies/remove`

            let response = await fetch(api_url, fetchOptions)

            let result = await response.json()

            // create new technology-Array without removed technology
            if(result.status) {
                let newArray = []
                data.technologies.forEach(technology => {
                    if(technology.ID != id) {
                        newArray.push(technology)
                    }
                })
                data.technologies = newArray
            }
            else {
                error(result.message)
            }
        }

        // fetch all technologies on page setup
        fetchTechnologies()

        return { data, removeTechnology, addTechnology }
    }
}
</script>

<style scoped>
    .content {
        background:#fff;
        padding: 30px;
        text-align: center;
        margin-left: 15%;
        margin-right: 15%;
        margin-top: 5%;
        box-shadow: 1px 1px 3px #b8b8b8;
        border-radius: 7px;
    }
    .technologies div {
        display: inline-block;
        margin: 10px;
        background:#00aaed;
        max-width: 250px;
        text-align: center;
        padding: 10px;
        border-radius: 30px;
    }
    .technologies div * {
        text-align: left;
        display: inline-flex;
        color:#fff;
    }
    .technologies div i {
        cursor:pointer;
    }
    .technologies div p {
        margin-right: 10px;
        font-weight: bold;
    }
    h1 {
        text-align:left;
        display: block;
    }
    .form {
        margin-bottom: 2%;
        margin-top:2%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .form button {
        background: #00aaed;
        border:0;
        width: 30px;
        height:30px;
        font-size: 15pt;
        padding: 5px;
        padding-left: 10px;
        padding-right:10px;
        text-align: center;
        border-radius: 30px;
        display: inline-block;
        margin: 2px;
        font-weight: bold;
        color:#fff;
        box-shadow: 1px 1px 3px #b8b8b8;
        cursor: pointer;
    }
    .form * {
        margin: 10px;
    }
    .form input {
        border:0;
        height: 30px;
        box-shadow: 1px 1px 3px #b8b8b8;
        padding: 5px;
        width: 300px;
        border-radius: 30px;
        padding-left:10px;
    }
</style>