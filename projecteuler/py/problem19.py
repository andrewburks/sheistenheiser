#!/usr/bin/python

from common import timed_func
import datetime

@timed_func
def problem19_lazy():
    sundays = 0
    for y in xrange(1901, 2001):
        for m in xrange(1, 13):
            if datetime.date(y, m, 1).weekday() == 6:
                sundays += 1

    return sundays

if __name__ == '__main__':
    print problem19_lazy()
