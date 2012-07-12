#!/usr/bin/python
from math import sqrt
import time


### Timing utilities ##########################################################
def timed_func(func):
    def funcTimer(*args, **kwargs):
        start = time.time()
        results = func(*args, **kwargs)
        elapsedTime = (time.time() - start) 
        print 'Function %s executed in %s seconds' % (func.__name__, elapsedTime)
        return results

    return funcTimer


### Arithmetic utilities ######################################################
# Constants not found in the math module
PHI = (1 + 5**0.5) / 2

def fib(limit = None):
    '''Fibonacci sequence generator.  Yields all Fibonacci numbers less than the specified limit. 
    If no limit is specified then the generator will generate the sequence indefinitely...'''
    a, b = 0, 1
    while limit is None or (limit is not None and a < limit): 
        yield a
        a, b = b, a + b

def n_fib(n):
    '''Fibonacci sequence generator.  Yields the first N Fibonacci numbers.'''
    a, b = 0, 1
    while n > 0: 
        yield a
        a, b, n = b, a + b, n - 1

_SQRT_5 = sqrt(5)
def fib_n(n):
    '''Implementation of Binet's formula for calculating the Nth Fibonacci number.'''
    return ((1 + _SQRT_5) ** n - (1 - _SQRT_5) ** n) / ((2 ** n) * _SQRT_5)

def eratosthenes_primes(limit):
    '''Generates prime numbers based on the sieve algorithm as described by Eratosthenes.'''
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


def atkins_primes(limit):
    '''Not yet implemented...'''
    raise NotImplementedError('atkin\'s sieve not yet implemented...')


def divisors(n):
    '''Naive implementation for finding divisors of n.  Should suffice for reasonable small numbers.'''
    divs = [1, n]
    for i in xrange(2, int(sqrt(n)+1)):
        if n % i == 0:
            divs += (i, n / i)

    return sorted(set(divs))


def proper_divisors(n):
    '''A deterministic yet naive implementation for finding proper divisors of n.'''
    divs = [1]
    for i in xrange(2, int(sqrt(n)+1)):
        if n % i == 0:
            divs += (i, n / i)

    return sorted(set(divs))


def prime_factors(n):
    '''Returns a list of the prime factors for the specified number.  Duplicates included.  1 and n excluded.'''
    factors = [] 
    i = 2
    while i**2 <= n:
        while n % i == 0:
            n /= i
            factors.append(i)
        i += 1

    if n > 1:
        factors.append(n)

    return factors

    
def is_prime(n): 
    
	divisor = 3 
	limit = int(n ** 0.5) + 1

	while divisor < limit:
		if n % divisor == 0:
			return False
		else:
			divisor += 2 

	return True


def prime_gen():
    '''Yields the sequence of prime numbers via the Sieve of Eratosthenes.
    See http://code.activestate.com/recipes/117119/
    '''
    D = {}  # map composite integers to primes witnessing their compositeness
    q = 2   # first integer to test for primality
    while True:
        if q not in D:
            yield q        # not marked composite, must be prime
            D[q*q] = [q]   # first multiple of q not already marked
        else:
            for p in D[q]: # move each witness to its next multiple
                D.setdefault(p+q,[]).append(p)
            del D[q]       # no longer need D[q], free memory
        q += 1
