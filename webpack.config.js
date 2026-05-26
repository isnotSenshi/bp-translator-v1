import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default () => {
     return {
          mode: 'development',
          entry: './src/index.jsx',
          output: {
               path: path.resolve(__dirname, 'dist'),
               filename: 'bundle.js'
          },
          module: {
               rules: [
                    {
                         test: /\.(js|jsx)$/,
                         exclude: /node_modules/,
                         use: {
                              loader: 'babel-loader'
                         }
                    },
                    {
                         test: /\.css$/,
                         use: ['style-loader', 'css-loader']
                    }
               ]
          },
          resolve: {
               extensions: ['.js', '.jsx']
          },
          performance: {
               hints: false
          },
          devServer: {
               static: {
                    directory: path.join(__dirname, 'public')
               },
               hot: true,
               historyApiFallback: true,
               port: 3000
          }
     }
}