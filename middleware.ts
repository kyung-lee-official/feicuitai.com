import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	// Get client IP address from headers
	const forwarded = request.headers.get("x-forwarded-for");
	const ip = forwarded
		? forwarded.split(",")[0]
		: request.headers.get("x-real-ip") ||
		  request.headers.get("cf-connecting-ip") || // Cloudflare
		  request.headers.get("x-client-ip") ||
		  "unknown";

	console.log("Client IP:", ip);

	// Skip processing for local IPs
	if (
		ip === "unknown" ||
		ip.startsWith("127.") ||
		ip.startsWith("192.168.") ||
		ip.startsWith("10.")
	) {
		return NextResponse.next();
	}

	try {
		// Get country from IP (using free service for demo)
		const geoResponse = await fetch(
			`http://ip-api.com/json/${ip}?fields=country,countryCode`
		);
		const geoData = await geoResponse.json();

		// Example: Redirect Chinese users to Chinese version
		if (geoData.countryCode === "CN") {
			const url = request.nextUrl.clone();
			if (!url.pathname.startsWith("/zh")) {
				url.pathname = "/zh" + url.pathname;
				return NextResponse.redirect(url);
			}
		}

		// Example: Block certain countries
		if (isBlockedCountry(geoData.countryCode)) {
			return NextResponse.redirect(new URL("/blocked", request.url));
		}
	} catch (error) {
		console.error("Error in geolocation middleware:", error);
	}

	// Continue to the requested page
	return NextResponse.next();
}

function isBlockedCountry(countryCode: string): boolean {
	// Add countries you want to block
	const blockedCountries = ["XX", "YY"]; // Replace with actual country codes
	return blockedCountries.includes(countryCode);
}

// Configure which routes the middleware should run on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
