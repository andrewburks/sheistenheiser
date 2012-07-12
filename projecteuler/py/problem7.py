#!/usr/bin/python
from common import prime_gen, timed_func

@timed_func
def problem7():
    for i, p in enumerate(prime_gen()):
        if i == 10001:
            return p

if __name__ == '__main__':
    print problem7()
