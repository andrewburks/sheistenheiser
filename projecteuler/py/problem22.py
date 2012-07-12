#!/usr/bin/python

from common import timed_func

@timed_func
def problem22():
    with open('projecteuler/py/problem22.data') as f:
        datum = enumerate(sorted([str.strip(name, '"') for name in f.read().split(',')]))
        return sum([((data[0] + 1) *  sum([(ord(c)-64) for c in data[1]])) for data in datum])

if __name__ == '__main__':
    print problem22()
