require 'mathn'
# 2520 is the smallest number that can be divided by each of the numbers
# from 1 to 10 without any remainder.
#
# What is the smallest number that is evenly divisible by all of the
# numbers from 1 to 20?

# brute force try every number - go make a coffee... this takes a long while
def smallest_divisible_by_all (number)
  found = 0
  n = number

  while found == 0
    n += 1
    (2..number).each do |i|
      break if n % i != 0
      found = n if i == number
    end
  end

  found
end

def get_prime_factors (number)
  n = number
  return 1 if n == 1

  primes = Prime.new
  factors = Array.new

  primes.each do |prime|
    next if prime == 1
    break if prime > number
    while n % prime == 0
      factors << prime
      n = n / prime
    end
  end

  factors
end

def fast_sdba (n)
  max_exp_primes = Hash.new
  sdba = 0

  (2..n).each do |i|
    prime_factors = get_prime_factors(i)
    tmp_max_exp_primes = Hash.new
    prime_factors.each do |j|
      if tmp_max_exp_primes[j].nil?
        tmp_max_exp_primes[j] = 1
      else
        tmp_max_exp_primes[j] = tmp_max_exp_primes[j]+=1
      end
    end

    tmp_max_exp_primes.each_pair do |key, val|
      if max_exp_primes.has_key?(key)
        if max_exp_primes[key] < val
          max_exp_primes[key] = val
        end
      else
        max_exp_primes[key] = val
      end
    end

    sdba = 1 if max_exp_primes.length
    max_exp_primes.each_pair do |key, val|
      sdba = sdba * key**val
    end
  end
  
  sdba
end

puts "Smallest number where mod (2..20) = 0: #{fast_sdba(20)}"
# answer 232792560