
var sum = 0.0;
var x = 1;

for (x = 1; x < 1000; x++) {
    if (x % 3 === 0 || x % 5 === 0) {
        sum += x;
    }
}

console.log('%s', sum);
process.exit(0);