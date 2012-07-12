#!/usr/bin/python

from common import timed_func
from math import factorial as fact

@timed_func
def problem15(m, n):
    return (fact(m + n)) / (fact(m) * fact(n))

if __name__ == '__main__':
    print problem15(20, 20)
