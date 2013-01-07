#!/usr/bin/python

from common import timed_func, proper_divisors

def abundant_numbers(limit):
    abundant_nums = []
    for n in xrange(1, limit):
        if sum(proper_divisors(n)) > n:
            abundant_nums.append(n)
    return abundant_nums

def non_abundant_sums(limit):
    sieve = range(1, limit)
    abundant_nums = abundant_numbers(limit)
    for a1 in abundant_nums:
        for a2 in abundant_nums:
            abundant_sum = a1 + a2 - 1
            if abundant_sum < len(sieve):
                sieve[abundant_sum] = 0
    return sieve

@timed_func
def problem23():
    return sum(non_abundant_sums(28123))

if __name__ == '__main__':
    print problem23()