module.exports = {
    entry : "./main.js",
    devServer:{
        host:'192.168.1.95',
        port:8000
    },
    module:{
        rules:[
            {
                test:/\.js$/,
                use:{
                    loader:"babel-loader",
                    options:{
                        presets:['@babel/preset-env'],
                        plugins:[["@babel/plugin-transform-react-jsx",{pragma:"createElement"}]]
                    }
                }
            }
        ]
    },
    mode:"development"
}