<!--

 * Path: '/client/src/components/TechnologyDialog.vue'
 * Author: Samis Moser
 * Desc: Technology-Dialog-Component (to add technologies to project)

-->
<template>
    <div class="content">
        <h3>Technologie hinzufügen</h3>
        <div class="list">
            <div v-for="technology in data.technologies" v-bind:key="technology.ID" @click="addTechnology(technology.ID)">
                <p>{{technology.title}}</p>
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
    setup(props, context) {
        // set reactive data object to manipulate the DOM
        const data = reactive({technologies: []})

        // api-call [ GET '/api/technologies/getAll' ]
        const getTechnologies = async() => {
            let fetchOptions = {
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": localStorage.jwt
                }
            }
            // api-call [ GET '/api/technologies/getAll' ]
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/technologies/getAll`
            let response = await fetch(api_url, fetchOptions)
            let result = await response.json()

            data.technologies = result.data
        }
        // function to add technology from text input
        const addTechnology = (id) => {
            data.technologies.forEach(async technology => {
                if(technology.ID == id) {
                    context.emit("technologyAdded", technology)
                }
            })
        }
        setTimeout(async () => {
            // fetch technologies on page setup
            await getTechnologies()
        },100)

        
        return { data, addTechnology}
        
    }
}
</script>
<style scoped>
.list div {
    background: #00aaed;
    max-width: 150px;
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
</style>