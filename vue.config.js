module.exports = {
    devServer: {
        port: 80,
        proxy: {
            '/': {
                target: 'http://localhost:8080',
                ws: true,
                changeOrigin: true
            }
        },
        disableHostCheck: true
    },
    "transpileDependencies": [
        "vuetify"
    ],
}
