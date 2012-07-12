# The sum of the squares of the first ten natural numbers is,
#
# 1^2 + 2^2 + ... + 10^2 = 385
# The square of the sum of the first ten natural numbers is,

# (1 + 2 + ... + 10)^2 = 55^2 = 3025
# Hence the difference between the sum of the squares of the first ten natural numbers and the square of the sum is 3025  385 = 2640.

# Find the difference between the sum of the squares of the first one hundred natural numbers and the square of the sum.


def diff_sum_sqr_and_sqr_sum (n)
  sum = sum_sqr = 0
  (1..n).each do |i|  
    sum += i
    sum_sqr += (i**2)
  end
  (sum**2) - sum_sqr
end

puts "sum_sqr - (sum**2) = #{diff_sum_sqr_and_sqr_sum(100)}"
