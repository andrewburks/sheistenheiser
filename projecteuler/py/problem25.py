#!/usr/bin/python
from common import timed_func, fib
from math import floor, log10

@timed_func
def problem25():
    for n, f in enumerate(fib()):
        if (floor(log10(f if f != 0 else 1)) + 1) == 1000:
            return n

if __name__ == '__main__':
    print problem25()




import math 
import decimal

_SQRT_5 = decimal.Decimal(5).sqrt()
_ONE = decimal.Decimal(1)
_TWO = decimal.Decimal(2)
def fib_n(n):
    '''Implementation of Binet's formula for calculating the Nth Fibonacci number.'''
    n = decimal.Decimal(n)
    t1 = (_ONE + _SQRT_5) ** n
    t2 = (_ONE - _SQRT_5) ** n
    t3 = (_TWO ** n) * _SQRT_5
    return long( t1 - t2 / t3 )
    #return long( (((_ONE + _SQRT_5) ** n+) - (_ONE - _SQRT_5) ** n) / ((_TWO ** n) * _SQRT_5) )


phi = (1 + 5**0.5) / 2


def fib2(n):
    return round(phi**n/_SQRT_5)

def fib1(n):
    return int(round((phi**n - (1-phi)**n) / 5**0.5))

from math import log
def fibinv(f):
    if f < 2:
        return f
    return int(round(log(f * 5**0.5) / log(phi)))


def foo():
    for i, f in enumerate(fib(10**1000)):
        if len(str(f)) >= 1000:
            return i, f


@timed_func
def problem25a():
    i, n = 1, 25
    while True:
        f = fib_n(i)
        print 'i=%s, n=%s, f=%s' % (i, n, f)
        l = len(str(f))
        if l > 1000:
            i, n = i - n / 2, n / 2
        elif l < 1000:
            i += n
        else:
            return i


