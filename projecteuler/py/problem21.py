#!/usr/bin/python

import math
from common import timed_func, divisors

@timed_func
def problem21():
    amicable = []
    for n in xrange(2, 10000):
        m = sum(divisors(n)[:-1])
        if n == sum(divisors(m)[:-1]) and n != m:
            amicable.append(tuple(sorted([n, m])))

    print sorted(set(amicable))
    return sum(map(sum, set(amicable)))

if __name__ == '__main__':
    print problem21()
