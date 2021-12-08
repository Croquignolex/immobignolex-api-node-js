// Required checker
module.exports.requiredChecker = (input) => {
    return inRange(input, 1);
};

// Check in range
const inRange = (input, min = 2) => {
    const length = input.toString().length;
    return length >= min;
}
