import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	// Get client IP
	const forwarded = request.headers.get("x-forwarded-for");
	const ip = forwarded
		? forwarded.split(",")[0]
		: request.headers.get("x-real-ip") ||
		  request.headers.get("cf-connecting-ip") ||
		  request.headers.get("x-client-ip") ||
		  "unknown";

	// You can add geolocation logic here
	const location = await getLocation(ip);

	return Response.json({
		ip,
		location,
		shouldRedirect: shouldRedirectUser(ip, location),
	});
}

async function getLocation(ip: string) {
	// Example using a free GeoIP service
	try {
		const response = await fetch(`http://ip-api.com/json/${ip}`);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error getting location:", error);
		return null;
	}
}

function shouldRedirectUser(ip: string, location: any): boolean {
	// Add your redirect logic here
	if (location?.country === "China") {
		return true;
	}
	return false;
}
