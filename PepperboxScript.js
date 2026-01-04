const URL_BASE = "https://pepperbox.tv";
const URL_SHOWS = "${URL_BASE}/shows-all";
const URL_BROWSE = "${URL_BASE}/browse";
const URL_LATEST = "${URL_BASE}/latest";
const URL_EXCLUSIVE = "${URL_BASE}/exclusive";
const URL_POPULAR = "${URL_BASE}/popular";
const URL_LIVE = "${URL_BASE}/live";
const URL_CONTINUE = "${URL_BASE}/continue-watching";
const URL_RECOMMENDED = "${URL_BASE}/recommended";
const URL_YOU = "${URL_BASE}/you";
const URL_HISTORY = "${URL_BASE}/history";
const URL_WATCHLIST = "${URL_BASE}/watchlist";
const URL_LIKED = "${URL_BASE}/liked";
const URL_FOLLOWS = "${URL_BASE}/follows";
const URL_ACCOUNT = "${URL_BASE}/account";
const URL_LOGIN = "${URL_BASE}/login";

const URL_BASE_VIDEO = "${URL_BASE}/video";
const URL_BASE_CHANNEL = "${URL_BASE}/creators";

const PLATFORM = "Pepperbox";
const PLATFORM_CLAIMTYPE = 4;

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 Mobile Safari/537.36';


let config = {};
let settings = {};

const isAndroid = bridge.buildPlatform === "android";

let state = {
    defaultHeaders: {
        'User-Agent': USER_AGENT,
    }
}

// Source Methods
source.enable = function (conf, setts, saveStateStr) {
    config = conf ?? {};
    settings = setts ?? {};

    if (saveStateStr) {
        state = JSON.parse(saveStateStr);
    }
}

source.saveState = () => {
    return JSON.stringify(state);
}

/**
 * Validates if a string is a valid URL
 * @param {string} str - The string to validate
 * @returns {boolean} True if the string is a valid URL
 */
function isValidUrl(str) {
	if (typeof str !== 'string') {
		return false;
	}

	// Basic URL validation - checks for http:// or https:// and a domain
	const urlPattern = /^https?:\/\/.+/i;
	return urlPattern.test(str);
}

/**
 * Gets the requested url and returns the response body either as a string or as a parsed json object
 * @param {Object|string} optionsOrUrl - The options object or URL string
 * @param {string} optionsOrUrl.url - The URL to call (when using object)
 * @param {boolean} [optionsOrUrl.useAuthenticated=false] - If true, will use the authenticated headers
 * @param {boolean} [optionsOrUrl.parseResponse=false] - If true, will parse the response as json and check for errors
 * @param {number} [optionsOrUrl.retries=5] - Number of retry attempts
 * @param {Object} [optionsOrUrl.headers=null] - Custom headers to use for the request
 * @returns {string | Object} the response body as a string or the parsed json object
 * @throws {ScriptException}
 */
function httpGET(optionsOrUrl) {
	// Check if parameter is a string URL
	let options;
	if (typeof optionsOrUrl === 'string') {
		if (!isValidUrl(optionsOrUrl)) {
			throw new ScriptException("Invalid URL provided: " + optionsOrUrl);
		}
		options = { url: optionsOrUrl };
	} else if (typeof optionsOrUrl === 'object' && optionsOrUrl !== null) {
		options = optionsOrUrl;
	} else {
		throw new ScriptException("httpGET requires either a URL string or options object");
	}

	const {
		url,
		useAuthenticated = false,
		parseResponse = false,
		retries = 5,
		headers = null
	} = options;

	if (!url) {
		throw new ScriptException("URL is required");
	}

	let lastError;
	let attempts = retries + 1; // +1 for the initial attempt

	while (attempts > 0) {
		try {
			const localHeaders = headers ?? state.defaultHeaders;

			const resp = http.GET(
				url,
				localHeaders,
				useAuthenticated
			);

			if (!resp.isOk) {

				throwIfCaptcha(resp);
				
				throw new ScriptException("Request [" + url + "] failed with code [" + resp.code + "]");
			}

			if (parseResponse) {
				const json = JSON.parse(resp.body);
				if (json.errors) {
					throw new ScriptException(json.errors[0].message);
				}
				return json;
			}

			return resp;
		} catch (error) {
			lastError = error;

			// Don't retry captcha exceptions - they require manual intervention
			if (error instanceof CaptchaRequiredException) {
				log(`Captcha detected for request: ${url}`);
				throw error;
			}

			attempts--;

			if (attempts > 0) {
				bridge.sleep(100);
			}

			if (attempts === 0) {
				// All retry attempts failed
				log(`Request failed after ${retries + 1} attempts: ${url}`);
				log(lastError);
				throw lastError;
			}
		}
	}
}

log("LOADED");