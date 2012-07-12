#!/usr/bin/python
import math

def problem9():
    for a in range(1000):
        for b in range(a + 1, 1000):
            aSqr = a**2
            bSqr = b**2
            c = int(math.sqrt(aSqr + bSqr)) 
            if b < c and aSqr + bSqr == c**2:
                if a + b + c == 1000:
                    return ({'a': a, 'b': b, 'c': c}, {'a * b * c': (a * b * c)},)


if __name__ == '__main__':
    print problem9()

