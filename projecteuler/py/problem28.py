#!/usr/bin/python
from common import timed_func

@timed_func
def problem28(dimension):
    curr_num = curr_dim = 1
    total = -1
    limit = dimension ** 2
    while curr_num <= limit:
        total += curr_num
        curr_num += curr_dim - 1
        if curr_num >= curr_dim ** 2:
            curr_dim += 2

    return total

if __name__ == '__main__':
    print problem28(1001)

