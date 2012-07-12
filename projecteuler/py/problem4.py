#!/usr/bin/python

def is_palindrome(p):
    p = str(p)
    return p == p[::-1]
    
def problem4():
    min_y = 1000 # the smallest y where a palindrome was found
    max_p = (0, 0, 0) # tuple of the 2 numbers whose product is the palindrome, and the palindrome
    for x in reversed(range(100,1000)):
        if x <= min_y and max_p[2] != 0:
            break
        for y in reversed(range(100,1000)):
            p = x * y
            if is_palindrome(p):
                min_y = min(min_y, y)
                if p > max_p[2]:
                    max_p = (x, y, p)

    return max_p

if __name__ == '__main__':
    print problem4()

