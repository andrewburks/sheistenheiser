#!/usr/bin/python
def fib(limit):
    a, b = 0, 1
    while a < limit: 
        yield a
        a, b = b, a + b

if __name__ == '__main__':
    print sum( (f for f in fib(4000000) if not f % 2) )

