#!/usr/bin/python

from common import timed_func

def prime_factors(n):
    i = 2
    while i**2 <= n:
        while n % i == 0:
            n /= i
            yield i
        i += 1

    if n > 1:
        yield n

def number_of_divisors(n):
    num_divs = 1
    curr_f = None
    cnt_f = 0

    for f in prime_factors(n):
        if curr_f is None:
            curr_f = f
        elif curr_f != f:
            num_divs *= (cnt_f + 1)
            curr_f = f
            cnt_f = 0

        cnt_f += 1

    num_divs *= (cnt_f + 1)

    return num_divs

@timed_func
def problem12():
    for triangle_num in ((n * (n + 1)) / 2 for n in xrange(0, 1000000)):
        if number_of_divisors(triangle_num) > 500:
            return triangle_num

if __name__ == '__main__':
    print problem12()
