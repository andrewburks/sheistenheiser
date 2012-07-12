#!/usr/bin/python
from common import timed_func

@timed_func
def problem29(limit):
    combinations = set()
    for a in xrange(2, limit + 1):
        for b in xrange(2, limit + 1):
            combinations.add(a ** b)
    return len(combinations)

if __name__ == '__main__':
    print problem29(100)

