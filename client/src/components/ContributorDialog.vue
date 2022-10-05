<!--

 * Path: '/client/src/components/ContributorDialog.vue'
 * Author: Samis Moser
 * Desc: Contributor-Dialog-Component (to add contributors to project)

-->
<template>
    <div class="content">
        <h3>Teilnehmer hinzufügen</h3>
        <input @input="searchUser()" type="text" placeholder="Suche.." id="userSearch">
        <div class="results">
            <div v-for="user in data.usersFound" v-bind:key="user.ID" @click="addUser(user.sAMAccountName)">
                {{user.displayName}}
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
        // set reactive object for manipulating the DOM
        const data = reactive({usersFound:[]})

        // function to add user to contributors-array in NewProject / EditProject component
        // emits 'contributorAdded' event
        const addUser = (sAMAccountName) => {
            context.emit("contributorAdded", sAMAccountName)
        }

        // function to search for users in active directory
        // sets 'data.usersFound' to array of found user objects
        const searchUser = async () => {
            let fetchOptions = {
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json"
                }
            }
            // escape search-query-string as it has to be sent via URL
            let escaped = encodeURIComponent(event.target.value)
            // api-call [ GET '/api/users/getUserFull' ]
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/getUserFull?querystring=${escaped}`
            setTimeout(async () => {
                let response = await fetch(api_url,fetchOptions)
                let result = await response.json()
                data.usersFound = result.data
            },100)    
        }
        return {data, searchUser, addUser}
    }
}
</script>
<style scoped>
.results div {
    max-width: 300px;
    background: #00aaed;
    border-radius: 30px;
    display: inline-block;
    margin: 2px;
    padding: 5px;
    padding-left:10px;
    padding-right:10px;
    color:white;
    cursor: pointer;
}
</style>