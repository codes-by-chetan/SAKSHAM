import os from "os";

const getHostIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] || []) {
      if (info.family === "IPv4" && !info.internal) {
        return info.address;
      }
    }
  }
  return "localhost";
};

export default getHostIpAddress;
