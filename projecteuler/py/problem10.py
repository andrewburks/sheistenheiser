#!/usr/bin/python
from common import eratosthenes_primes, timed_func

@timed_func
def problem10():
    return sum(eratosthenes_primes(2000000))

if __name__ == '__main__':
    print problem10()

