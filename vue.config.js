module.exports = {
    devServer: {
        port: 3000,
        proxy: {
            '/': {
                target: 'http://web:80',
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
