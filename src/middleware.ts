export { auth as default } from "next-auth/middleware";

export const config = {
	matcher: ["/buyers/:path*", "/api/:path*"],
};
