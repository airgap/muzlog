import TerserPlugin from 'terser-webpack-plugin';

export default {
    target: 'node',
    entry: './src/index.ts',
    output: {
        filename: '[name].js',
        path: new URL('./../dist', import.meta.url).pathname,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    mode: 'development',
    devtool: "inline-source-map",
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {test: /\.tsx?$/, loader: "ts-loader"}
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({parallel: true})
        ]
    }
};
