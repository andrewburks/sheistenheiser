require 'mathn'
# To change this template, choose Tools | Templates
# and open the template in the editor.


primes = Prime.new

cnt = 10001
primes.each do |i|
  cnt-=1
  if cnt == 0
    puts "10001st prime is #{i}"
    break
  end
end

