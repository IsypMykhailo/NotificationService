exports.isNullOrWhiteSpace = function (str) {
    return str == null || str.trim() === ''
}

function validate(regex, str) {
    const res = regex.exec(str);
    const valid = !!res;
    return valid;
}