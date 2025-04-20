import withPWA from "next-pwa";
import path from "path";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
});

export default pwaConfig({
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
});
