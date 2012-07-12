#!/usr/bin/python

from common import timed_func
from problem18 import MaxPathFinder

def create_tree(file_name):
    with open(file_name) as f:
        data = []
        for line in f:
            data.append([int(n) for n in line.split()])
        return data

@timed_func
def problem67(tree):
    return MaxPathFinder(tree).max_root_path_value()

if __name__ == '__main__':
    print problem67(create_tree('./problem67.data'))
