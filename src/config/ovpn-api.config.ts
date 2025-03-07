import { registerAs } from "@nestjs/config";

export default registerAs("ovpnApi", () => ({
  url: process.env.OPENVPN_API_URL,
}));
