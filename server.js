const express = require('express')
const graphqlHTTP = require('express-graphql')

const {typeDefs, get_resolvers} = require('./schema')
const {makeExecutableSchema} = require('graphql-tools')

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: get_resolvers('http://wekan.triagem1'),
})

const app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: null,
  graphiql: true,
}))
app.listen(4000,() => {
    console.log('listening on port 4000')
})
