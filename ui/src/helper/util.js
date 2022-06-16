export const convertSeconds = function (date) {
    if (date) {
        let seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const SECONDS_PER_DAY = 86400;
        const HOURS_PER_DAY = 24;
        const days = Math.floor(seconds / SECONDS_PER_DAY);
        const remainderSeconds = seconds % SECONDS_PER_DAY;
        const hms = new Date(remainderSeconds * 1000).toISOString().substring(11, 19);
        const replaced = hms.replace(/^(\d+)/, h => `${Number(h) + days * HOURS_PER_DAY}`.padStart(2, '0'));
        const strings = replaced.split(":");
        let output = ""
        output += parseInt(strings[0]) > 0 ? parseInt(strings[0]) + "h" : ""
        output += parseInt(strings[1]) > 0 ? parseInt(strings[1]) + "m" : ""
        output += parseInt(strings[2]) > 0 ? parseInt(strings[2]) + "s" : ""
        return output
    }
    return ""
}
