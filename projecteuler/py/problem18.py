#!/usr/bin/python

import pprint
from common import timed_func

DATA = '''75
95 64
17 47 82
18 35 87 10
20 04 82 47 65
19 01 23 75 03 34
88 02 77 73 07 63 67
99 65 04 28 06 16 70 92
41 41 26 56 83 40 80 70 33
41 48 72 33 47 32 37 16 94 29
53 71 44 65 25 43 91 52 97 51 14
70 11 33 28 77 73 17 78 39 68 17 57
91 71 52 38 17 14 91 43 58 50 27 29 48
63 66 04 68 89 53 67 30 73 16 69 87 40 31
04 62 98 27 23 09 70 98 73 93 38 53 60 04 23'''

TEST_DATA='''3
7 4
2 4 6
8 5 9 3'''

def create_tree(d=DATA):
   data = []
   for line in d.split('\n'):
        data.append([int(n) for n in line.split()])
   
   return data

class MaxPathFinder(object):
    def __init__(self, tree):
        self._paths = {}
        self._tree = tree

        self.scan_tree()

    def root_node(self):
        return (self._tree[0][0],0,0)

    def left_node(self, from_row, from_idx):
        row, idx = from_row + 1, from_idx
        return None if row == len(self._tree) else (self._tree[row][idx], row, idx) 
    
    def right_node(self, from_row, from_idx):
        row, idx = from_row + 1, from_idx + 1
        return None if row >= len(self._tree) or idx >= len(self._tree[row]) else (self._tree[row][idx], row, idx)

    def scan_tree(self):
        # Starting at the pentultimate row and working backwards, use the
        # self._paths dictionary as a linking structure for recording and
        # selecting the max valued paths as we approach the root node 
        for r in reversed(range(len(self._tree) - 1)):
            for i in range(len(self._tree[r])):
                v = self._tree[r][i]
                left = self.left_node(r, i)
                right = self.right_node(r, i)
                if self.max_path_value(left) > self.max_path_value(right):
                    self._paths[(v,r,i)] = left
                else:
                    self._paths[(v,r,i)] = right
        
    def max_path_value(self, path_node):
        if path_node is None:
            return 0
        else:
            if path_node in self._paths:
                return sum([node[0] for node in self.max_path(path_node,)])
            return path_node[0]

    def max_path(self, path_node):
        if path_node in self._paths:
            path = [path_node] 
            next_node = self._paths[path_node]
            while next_node is not None:
                path.append(next_node)
                next_node = self._paths.get(next_node)
            return path
        else:
            return None

    def max_root_path_value(self):
        return self.max_path_value(self.root_node())
        
@timed_func
def problem18(tree):
    return MaxPathFinder(tree).max_root_path_value()

if __name__ == '__main__':
    print problem18(create_tree())
