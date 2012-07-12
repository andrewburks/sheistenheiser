#!/usr/bin/python

from common import timed_func

@timed_func
def problem13():
    with open('projecteuler/py/problem13.data') as numbers:
        return str(sum(long(number.strip()) for number in numbers))[:10]

if __name__ == '__main__':
    print problem13()
