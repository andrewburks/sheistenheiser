# If we list all the natural numbers below 10 that are multiples
# of 3 or 5, we get 3, 5, 6 and 9. The sum of these multiples is 23.
#
# Find the sum of all the multiples of 3 or 5 below 1000.

i = 0
sum = 0
while i < 1000
  if i.modulo(3) == 0 || i.modulo(5) == 0
    sum = sum + i
  end
  i = i + 1
end
puts "The sum of all multiples of 3 and 5 less than 1000: #{sum}"
