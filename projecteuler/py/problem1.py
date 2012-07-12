
def problem1():
    return sum([x for x in xrange(1000) if not x % 3 or not x % 5])

if __name__ == '__main__':
    print problem1()

