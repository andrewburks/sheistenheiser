#!/usr/bin/python

from common import timed_func

def hailstone(n):
    seq = []
    while n != 1:
        seq.append(n)
        if n % 2:
            n = (3 * n) + 1
        else:
            n = n / 2
    seq.append(n)
    return seq
    

def max_len_hailstone(limit):
    cache = {}
    
    for start in xrange(1, limit + 1):
        n = start
        length = 1
        while n != 1:
            if n in cache:
                length += cache[n] -1
                break
            else:
                length += 1
                if n % 2:
                    n = (3 * n) + 1
                else:
                    n = n / 2
        cache[start] = length 
        length = 0

    return max(cache.items(), key=lambda x: x[1])

@timed_func
def problem14():
    return max_len_hailstone(999999)

if __name__ == '__main__':
    print problem14()
