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

log("LOADED");