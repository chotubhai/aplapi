const config={
    production :{
        SECRET: "79d96892-4d71-4d0d-be2a-56d3fea1fa3f",
        DATABASE: process.env.MONGO_URI
    },
    default : {
        SECRET: '79d96892-4d71-4d0d-be2a-56d3fea1fa3f',
        DATABASE: ''
    }
}


exports.get = function get(env){
    return config[env] || config.default
}