#!/usr/bin/python

from common import timed_func, proper_divisors


def abundant_nums(limit):
    for n in xrange(12, limit):
        if sum(proper_divisors(n)) > n:
            yield n

def perfect_nums(limit):
    for n in xrange(3, limit):
        if sum(proper_divisors(n)) == n:
            yield n

def non_abundant_sums(limit):
    sieve = range(1, 28124)
    
    

    pass

@timed_func
def problem23():
    return sum((i for i in xrange(1, 28124) if sum(divisors(i)[:-1]) > i))

if __name__ == '__main__':
    #print problem23()
    print list(abundant_nums(100))
    print list(perfect_nums(20000))
