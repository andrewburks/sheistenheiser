# The prime factors of 13195 are 5, 7, 13 and 29.
#
# What is the largest prime factor of the number 600851475143 ?

# Sieve of Eratosthenes
def get_primes (n)
  # prime the seive
  sieve = Array.new(n.to_i - 1)
  idx = 0
  (2..n).each { |i| 
    sieve[idx] = i.to_i
    idx+=1
  }

  p = 2
  while p < n
    idx = (p**2)-2 # start the inner loop at the square of p (adjusted for array indices)
    while idx < n
      sieve[idx] = nil
      idx+=p # increment by p to knock out all the multiples of p
    end
    p+=1
  end

  sieve.compact
end

def get_prime_factors (num_to_factor)
  puts "Get prime factors for #{num_to_factor}"

  candidate_primes = get_primes(Math.sqrt(num_to_factor))
  puts "Sieved #{candidate_primes.length} primes..."

  prime_factors = Array.new
  n = num_to_factor
  candidate_primes.each do |prime|  
    while n % prime == 0
      prime_factors << prime
      n = n / prime
    end
  end
  prime_factors
end 

#num_to_factor = 600851475143
num_to_factor = 13195
prime_factors = get_prime_factors(num_to_factor)

prime_factors.each { |i| puts "#{i}"}