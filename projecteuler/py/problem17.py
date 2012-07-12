#!/usr/bin/python

from common import timed_func

def length(n):
    l = 0
    thousand = n / 1000
    if thousand:
        l += length(thousand) + 8

    hundred = n % 1000 / 100
    if hundred:
        l += length(hundred) + 7

    ten = n % 100
    if ten:
        if hundred:
            l += 3 # 'and'
        if ten <= 19 or ten % 10 == 0:
            if ten in (1,2,6,10):
                l += 3
            if ten in (3,7,8,40,50,60):
                l += 5
            if ten in (4,5,9):
                l += 4
            if ten in (11,12,20,30,80,90):
                l += 6
            if ten in (13,14,18,19):
                l += 8
            if ten in (15,16,70):
                l += 7
            if ten in (17,):
                l += 9
        else:
            l += length(ten % 10) + length (ten / 10 * 10)

    return l

@timed_func
def problem17(n):
    return sum( (length(x) for x in xrange(1, n+1)) )

if __name__ == '__main__':
    print problem17(1000)
