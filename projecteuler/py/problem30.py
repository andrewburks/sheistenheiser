#!/usr/bin/python
from common import timed_func
from math import floor, log10


def upperlimit(n, l):
    return 9 ** n * l

def lennum(n):
    return int(floor(log10(n))) + 1


@timed_func
def problem30(n):
    narcissists = []
    
    # determine search ranges...
    p9 = 9 ** n
    ranges = []
    start = 2
    for x in xrange(2, n + 1):
        

    f = 2
    t = 10 ** (n + 1)
    
    print 'from: %s to: %s' % (f, t)

    for x in xrange(f, t):
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

