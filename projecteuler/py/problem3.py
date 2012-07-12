#!/usr/bin/python
import math

def eratosthenes_primes(limit):
    sieve = range(2, int(limit)-1)
    len_sieve = len(sieve)

    n = 2
    while n < len_sieve:
        idx = int((n ** 2) - 2)
        while idx < len_sieve:
            sieve[idx] = None
            idx += n
        n += 1

    return filter(lambda x : x is not None, sieve)

def prime_factors(x):
    n = x
    factors = []
    for prime in eratosthenes_primes(math.sqrt(x)):
        while n % prime == 0:
            factors.append(prime)
            n = n / prime
    
    return factors

if __name__ == '__main__':
    print max(prime_factors(600851475143))

