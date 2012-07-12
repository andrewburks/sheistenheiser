#!/usr/bin/python
from common import timed_func
import itertools
import math

def _next(sequence):
    '''Calculates the next lexicographic permutation for the provided sequence.'''
    i = len(sequence) - 2
    while i >= 0:
        if i == 0 and sequence[i] == max(sequence):
            return None
        elif sequence[i] < sequence[i + 1]:
            first = sequence[:i]
            last = sequence[i:]
            min_val = min(filter(lambda x: x > sequence[i], last))
            last.remove(min_val)
            return first + [min_val] + sorted(last)
        else:
            i -= 1
    return None

def perms(sequence):
    s = sorted(sequence)
    while s:
        yield s
        s = _next(s)
    
def nth_perm(n, sequence):
    s = sorted(sequence)
    p = []
    for i in xrange(len(s) - 1, -1, -1):
        f = math.factorial(i)
        x = 1
        while True:
            if n <= x * f:
                idx = x - 1
                p.append(s[idx])
                del s[idx]
                n -= f * (x - 1)
                break
            x += 1
    return p
            
@timed_func
def problem24a():
    for n, p in enumerate(perms([0,1,2,3,4,5,6,7,8,9])):
        if n == 999999:
            return p

@timed_func
def problem24b():
    for n, p in enumerate(itertools.permutations([0,1,2,3,4,5,6,7,8,9])):
        if n == 999999:
            return p

@timed_func
def problem24c():
    return nth_perm(1000000, [0,1,2,3,4,5,6,7,8,9])

if __name__ == '__main__':
    print problem24a()
    
    print problem24b()
    
    print problem24c()

