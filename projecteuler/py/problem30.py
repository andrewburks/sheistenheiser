#!/usr/bin/python
from common import timed_func
from math import floor, log10

@timed_func
def problem30(n):
    narcissists = []
    
    start = 2
    end = 10 ** (n + 1)

    for x in xrange(start, end):
        s = 0
        l = int(floor(log10(x))) + 1
        for y in xrange(l, 0, -1):
            digit = (x % 10 ** y) / (10 ** (y - 1))
            s += digit ** n

        if s == x:
            narcissists.append(x)
    return narcissists

if __name__ == '__main__':
    soln = problem30(5)
    print soln, sum(soln)

