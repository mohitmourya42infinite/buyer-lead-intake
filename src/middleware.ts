export { default } from "next-auth/middleware";

export const config = {
	matcher: ["/buyers/:path*", "/api/buyers/:path*"],
};
