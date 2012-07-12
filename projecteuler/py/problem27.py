#!/usr/bin/python
from common import timed_func, eratosthenes_primes
from math import sqrt

def is_prime(n):
	divisor = 3 
	limit = int(n ** 0.5) + 1

	while divisor < limit:
		if n % divisor == 0:
			return False
		else:
			divisor += 2 

	return True

@timed_func
def problem27():
    # b must be prime in order for (0) to be prime
    primes = eratosthenes_primes(1000)
    _a, _b, _np = None, None, None
    # Only consider odd values for a
    for a in xrange(-999, 1000, 2):
        for b in primes:
            # Since n**2 + a*n + b must be prime, then 1 + a + b must be prime, so a must be greater than -b - 1
            if a > -b - 1:
                n = 0
                while True:
                    num = n ** 2 + a * n + b
                    if num < 0:
                        break

                    if not is_prime(num):
                        break
                    n += 1

                if n > _np:
                    _a, _b, _np = a, b, n

    return _a, _b, _np, _a * _b

if __name__ == '__main__':
    print problem27()

