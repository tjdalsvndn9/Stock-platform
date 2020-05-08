const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const postcssPresetEnv = require('postcss-preset-env');

const ENTRY = "./src/index.js";
const VENDOR = "./src/vendor.js"
const OUTPUT_FILENAME = "assets/js/[name].[contentHash].bundle.js";
const OUTPUT = "build"
const PRODUCTION = "production"
const DEVELOPMENT = "development"

module.exports = (_env, argv) => {

    const isProduction = argv.mode === "production";
    const isDevelopment = !isProduction;
    
    return {
        devtool: isDevelopment && "cheap-module-source-map",
        mode: isProduction ? PRODUCTION : DEVELOPMENT,
        entry: {
            main: ENTRY,
            // vendor:VENDOR
        },
        output: {
            filename: OUTPUT_FILENAME,
            path: path.resolve(__dirname, OUTPUT),
            publicPath: "/"
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use:[
                        isProduction ? MiniCssExtractPlugin.loader : "style-loader",
                        "css-loader"
                    ]
                },
                {
                    test: /\.s[ac]ss$/i,
                    loader: 'sass-loader',
                    options: {
                        implementation: require('sass')
                    }
                },
                {
                    test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: "static/media/[name].[hash:8].[ext]"
                    },
                },
                {
                    test: /\.svg$/,
                    use: ["@svgr/webpack"]
                },
                {
                    test: /\.(eot|otf|ttf|woff|woff2)$/,
                    loader: require.resolve("file-loader"),
                    options:{
                        name: "static/media/[name].[hash:8].[ext]" 
                    }
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', "@babel/preset-react"],
                            plugins: ['@babel/plugin-proposal-object-rest-spread',
                                "@babel/plugin-proposal-throw-expressions",
                                "@babel/plugin-proposal-optional-chaining",
                                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                                "@babel/plugin-proposal-class-properties",
                                "@babel/plugin-proposal-optional-catch-binding",
                                "@babel/plugin-syntax-dynamic-import",
                                "@babel/plugin-transform-runtime",
                                "@babel/plugin-proposal-private-methods"
                            ],
                            envName: isProduction ? PRODUCTION : DEVELOPMENT,
                            env:{
                                production:{
                                    only:["src"],
                                    plugins:[
                                        [
                                            "transform-react-remove-prop-types",
                                            {
                                              removeImport: true
                                            }
                                        ],
                                        "@babel/plugin-transform-react-inline-elements",
                                        "@babel/plugin-transform-react-constant-elements"
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader"
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: [".js", ".jsx"]
        },
        plugins: [
            //html plugin
            new HtmlWebPackPlugin({
                template: path.resolve(__dirname, "public/index.html"),
                filename: 'index.html',
                inject: true,
            }),
            //extract CSS 
             new MiniCssExtractPlugin({
                filename: "assets/css/[name].[contenthash:8].css",
                chunkFilename: "assets/css/[name].[contenthash:8].chunk.css"
            }),
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": JSON.stringify(
                    isProduction ? "production" : "development"
                )
            })
        ]
    }
}