/** @type {import('next').NextConfig} 
const nextConfig = {
    webpack: (config) => {
        // 👇 Force FeexPay à utiliser la même instance de React.
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            react: require.resolve("react"),
            "react-dom": require.resolve("react-dom"),
        };
        //console.log(config.resolve.alias);
        return config;
    },
};

module.exports = nextConfig;**/
