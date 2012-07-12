#!/usr/bin/python
from common import timed_func

def find_cycle(numerator, denominator):
    digits = []
    numerators = set()
    curr = numerator
    while True:
        prev = curr

        while curr < denominator:
            curr = curr * 10
        
        if curr in numerators:
            return digits

        if curr % denominator == 0:
            return None

        numerators.add(curr)
        digits.append(curr / denominator)
        curr %= denominator

@timed_func
def problem26():
    d, l, c = 0, 0, []
    for denom in xrange(1, 1001):    
        cycle = find_cycle(1, denom)
        if cycle is not None and l <= len(cycle):
            d, l, c = denom, len(cycle), cycle
    return d

if __name__ == '__main__':
    print problem26()

